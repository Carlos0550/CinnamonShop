import { useAppContext } from "@/context/AppContext"
import "./css/Onboarding.css"
import { Form, Input, Upload } from "antd"
import { UserOutlined, UploadOutlined } from "@ant-design/icons"
import { useEffect, useState } from "react"
import { profileApi } from "@/services/profileApi"
import { toast } from "react-toastify"
import type { UploadFile, UploadProps } from 'antd';
import type { ApiResponse } from "@/types";
import { useNavigate } from "react-router-dom"

interface ProfilePhotoResponse {
    profileImageUrl: string;
}

function Onboarding() {
    const {
        authHooks:{
            setAuthData
        }
    } = useAppContext()
    
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate()

    const handleUpload = async (file: File) => {
        setUploading(true);
        const toastId = toast.loading('Subiendo imagen de perfil...');

        try {
            const result = await profileApi.uploadProfilePhoto(file) as ApiResponse<ProfilePhotoResponse>;
            
            if (result.success && result.data?.profileImageUrl) {
                const profileImageUrl = result.data.profileImageUrl;
                setAuthData(prev => ({
                    ...prev,
                    profileImageUrl: profileImageUrl
                }));
                
                setFileList([{
                    uid: '-1',
                    name: file.name,
                    status: 'done',
                    url: profileImageUrl,
                }]);
                localStorage.setItem("profileUrlRestore", profileImageUrl)
                toast.dismiss(toastId);
                toast.success('Imagen de perfil subida correctamente', {
                    autoClose: 1000 
                });
                return false; 
            } else {
                throw new Error(result.error || 'Error al subir la imagen');
            }
        } catch (error) {
            toast.dismiss(toastId);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            toast.error(`Error al subir imagen: ${errorMessage}`);
            return false;
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        const toastId = toast.loading('Eliminando imagen de perfil...');
        setUploading(true);
        try {
            const result = await profileApi.deleteProfilePhoto();
            
            if (result.success) {
                setAuthData(prev => ({
                    ...prev,
                    profileImageUrl: undefined
                }));
                
                setFileList([]);
                
                toast.dismiss(toastId);
                toast.success('Imagen de perfil eliminada correctamente', {
                    autoClose: 1000 
                });
            } else {
                throw new Error(result.error || 'Error al eliminar la imagen');
            }
        } catch (error) {
            toast.dismiss(toastId);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            toast.error(`Error al eliminar imagen: ${errorMessage}`);
        }finally{
            setUploading(false);
        }
    };

    useEffect(()=>{
        const restoredProfile = localStorage.getItem("profileUrlRestore")
        if(restoredProfile){
            setFileList([{
                uid: '-1',
                name: "restored",
                status: 'done',
                url: restoredProfile,
            }]);
        }

    },[])
    const uploadProps: UploadProps = {
        beforeUpload: handleUpload,
        fileList,
        onChange: ({ fileList: newFileList }) => setFileList(newFileList),
        onRemove: handleDelete,
        listType: "picture-card",
        maxCount: 1,
        accept: "image/*",
        disabled: uploading,
    
    };

    const [saving, setSaving] = useState(false)
    const saveProfile = async(values: any) => {
        
        setSaving(true)
        try {
            const result = await profileApi.updateProfile(values) as ApiResponse<any>

            if(result.success) {
                localStorage.removeItem("profileUrlRestore")
                return navigate("/")
            }

            toast.error(result.error || "Error desconocido.", {
                autoClose: 2000
            })
        } catch (error) {
            console.log(error)
            toast.error((error as Error).message || "Error desconocido.", {
                autoClose: 2000
            })
        }finally{
            setSaving(false)
        }
    }

    return (
        <div className="onboarding-container">
            <div className="onboarding-wrapper">
                <p className="onboarding-title">Hola 👋, antes que puedas continuar, necesitamos unos datos.</p>
                <Form name="onboarding" layout="vertical" onFinish={saveProfile}>
                    <Form.Item
                        name={"firstName"}
                        label="Ingresa tu/s nombre/s"
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Jhon"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name={"lastName"}
                        label="Ingresa tu/s apellido/s"
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Doe"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Foto de perfil (opcional)"
                        name="profileImage"
                    >
                        <Upload {...uploadProps} >
                            {fileList.length < 1 && (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Subir imagen</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    <button disabled={saving} type="submit" className="finish-onboarding-btn">Guardar perfil</button>
                </Form>
            </div>
        </div>
    )
}

export default Onboarding