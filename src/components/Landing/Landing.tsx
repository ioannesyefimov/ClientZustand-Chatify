import React from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import './Landing.scss'
import { landingBg } from '../../assets'
import Canvas from '../CanvasBg/Canvas'
const Landing: React.FC = () => {
  let location = useLocation()
    const navigate = useNavigate()

  const content = (
    <>
    <Canvas src={landingBg} />
    <div className='landing-component box-shadow--gray'>
      <div className="wrapper">
      <h3>Join our community and start communicating with them or your friends right now</h3>
      {/* <button type='button' onClick={()=> navigate('/auth/register')}>Register</button> */}
      <Link className='link' to="/auth/register">Register</Link>
      </div>
      <div className="wrapper">
      <h4>or log in to your account and contunie communicating!</h4>
      {/* <button type='button' onClick={()=> navigate('/auth/signin')}>Sign In</button> */}
      <Link className='link' to="/auth/signin">Signin</Link>
      </div>
</div>  
    </>
  )
    return content
}

export default Landing