import { Form, Input, Button } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useAppContext } from '@/context/AppContext'

function Register() {
  const {
    authHooks: { createUser }
  } = useAppContext()

  return (
    <>
      <Form name="register" layout="vertical" requiredMark={false} onFinish={({ email }) => createUser(email)}>
        <p className='form-subtitle'>Crear cuenta Cinnamon</p>

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

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
          >
            Crear cuenta
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

export default Register
