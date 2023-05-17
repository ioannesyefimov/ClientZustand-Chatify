import {Navigate, Outlet, useLocation} from 'react-router-dom'
import { useAuthStore } from '../../ZustandStore'
import { useAuthCookies } from '../../hooks'

const AuthenticationForm = () => {
  const user = useAuthStore(s=>s.user)
  
  let location = useLocation()
  if(location.pathname === '/auth') return <Navigate to='/auth/signin' replace/>
  if(!user?.email) return <Outlet/> 
  return <Navigate to='/chat' replace/>

  
  
}


export default AuthenticationForm