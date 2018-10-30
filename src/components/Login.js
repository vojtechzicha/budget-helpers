import { useEffect } from 'react'

const Login = ({ auth }) => {
  useEffect(() => {
    auth.login()
  }, [])

  return null
}

export default Login
