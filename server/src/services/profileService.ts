import prisma from "@/config/database";
import { SupabaseStorageUtils } from "./supabaseService";

const capitalizeNames = (name: string) => {
    if(!name) return ""
    return name.split(" ").map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(" ")
}

export class ProfileOperations extends SupabaseStorageUtils {

    async updateProfile(userId:string, firstName: string, lastName:string): Promise <void>{
        
        try {
            await prisma.user.update({
                where:{id: userId},
                data:{
                    firstName: capitalizeNames(firstName.trim()),
                    lastName: capitalizeNames(lastName.trim()),
                    onBoarding: false
                }
            })
        } catch (error) {
            console.log(error)
            throw new Error(`Error actualizando el perfíl del usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`)
        }
    }
    async updateProfilePhoto(userId: string, imageFile: Express.Multer.File): Promise<string> {
        try {
            const convertedFiles = await this.convertToWebp([{
                buffer: imageFile.buffer,
                originalName: imageFile.originalname
            }]);

            const { buffer } = convertedFiles[0];
            const finalFilename = `profile-${userId}-${Date.now()}.webp`;

            const { error } = await this.supabase.storage
                .from('profiles')
                .upload(finalFilename, buffer, {
                    contentType: 'image/webp',
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                throw new Error(`Error al subir la imagen: ${error.message}`);
            }

            const publicUrl = SupabaseStorageUtils.buildPublicUrl('profiles', finalFilename);

            await prisma.user.update({
                where: { id: userId },
                data: { profileImageUrl: publicUrl }
            });

            return publicUrl;
        } catch (error) {
            throw new Error(`Error al actualizar foto de perfil: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    async deleteProfilePhoto(userId: string): Promise<void> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { profileImageUrl: true }
            });

            if (!user?.profileImageUrl) {
                return;
            }

            const urlParts = user.profileImageUrl.split('/');
            const filename = urlParts[urlParts.length - 1];

            const { error } = await this.supabase.storage
                .from('profiles')
                .remove([filename]);

            if (error) {
                throw new Error(`Error al eliminar la imagen: ${error.message}`);
            }

            await prisma.user.update({
                where: { id: userId },
                data: { profileImageUrl: null }
            });
        } catch (error) {
            throw new Error(`Error al eliminar foto de perfil: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
}