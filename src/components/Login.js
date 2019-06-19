import { useEffect, useContext } from 'react'

import context from '../context'

const Login = () => {
  const { auth } = useContext(context)

  useEffect(() => {
    auth.login()
  }, [])

  return null
}

export default Login
