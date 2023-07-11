// import React, { useEffect } from 'react'
import './NavigationBar.scss'
// import NavLink from './NavLink'
import {  useAuthCookies, useWindowSize } from '../../hooks'
import { Link, useNavigate } from 'react-router-dom'
import { chatifyIco } from '../../assets'
// import Hamburger from '../HamburgerMenu/Hamburger'
import { useAuthStore } from '../../ZustandStore'
const NavigationBar = () => {
  const user = useAuthStore(s=>s.user)
  const clearState = useAuthCookies().clearState
  const navBar = user.email ? (
    <div className="flex">
       <button className='nav-btn link' onClick={()=>clearState('/auth', navigate)}>Logout</button>
      <button className='nav-btn back-btn link' onClick={()=>navigate(-1)}>Back</button>
    </div>
  ) : (
    <div className="flex">
       <Link className='nav-btn link' to='/auth/register' replace >Register</Link>
       <Link className='nav-btn link' to='/auth/signin' replace >Signin</Link>
    </div>
  )
  const navigate = useNavigate()
  const content =(
    <div className='navbar-component' >
        <button className='logo-btn link' onClick={()=>navigate('/chat')}>
          <img  src={chatifyIco} alt="logo" />
        </button>
      <div className="navbar-inner" id='navBarInner'>
      {navBar}
      </div>
    </div>
  ) 
    return content 
}

export default NavigationBar