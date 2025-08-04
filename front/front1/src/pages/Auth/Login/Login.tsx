import { Form, Input, Button } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useAppContext } from '@/context/AppContext'

function Login() {
  const {
    authHooks:{
      loginUser
    }
  } = useAppContext()
  return (
    <>
      <Form name="login"  layout="vertical" requiredMark={false} onFinish={(values) => loginUser(values.email, values.password)}>
        <p className='form-subtitle'>Iniciar sesión</p>
        <Form.Item
          name="email"
          label="Correo electrónico"
          rules={[{ required: true, message: 'Por favor ingresa tu correo' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="correo@ejemplo.com"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Contraseña"
          rules={[{ required: true, message: 'Ingresa tu contraseña' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Contraseña"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" block>
            Entrar
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

export default Login
