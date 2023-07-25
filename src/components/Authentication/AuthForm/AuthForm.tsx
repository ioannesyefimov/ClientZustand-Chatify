import React, { ChangeEvent, useState } from 'react'
import FormInput from '../../FormInput/FormInput'
import {lockerIco, mailIco, profileIco,authBg}   from '../../../assets/index' 
import { Link, useNavigate } from 'react-router-dom'
import { APIFetch, throwErr, validateInput } from '../../utils'
import AuthSocialButtons from '../../AuthButtons/AuthSocialButtons'
import Canvas from '../../CanvasBg/Canvas'
import { useServerUrl, useSetLoading } from '../../../hooks/useAuthContext/useAuthContext'
import './AuthForm.scss'
import { useResponseContext } from '../../../hooks'
import RegisterForm from './RegisterForm'
import SigninForm from './SigninForm'
type AuthProps = {
  type: string
  redirectType: string
  redirectUrl?:string
  getToken?:boolean
}
const initState = {
  email:"",  
  password:"",  
  userName:"",  
}
const AuthForm = ({type,redirectType,redirectUrl,getToken=false}:AuthProps) => {
 
 let registerContent = (
  <div className='auth-form-component box-shadow--gray'>
      <h2>Register</h2>
      <RegisterForm  type={type} redirectType={redirectType} redirectUrl={redirectUrl}/>
        <span  className='hint'>Already have an account? <Link to='/auth/signin'>Sing in</Link></span>
      </div>
 )

 let signinContent = (
    <div className='auth-form-component box-shadow--gray'>
      <h2>Login</h2>
      <SigninForm type={type} getToken={getToken}  redirectType={redirectType} redirectUrl={redirectUrl}/>
      {!getToken && <span className='hint'>Don't have an account yet? <Link to='/auth/register'>Register</Link></span> }
       
    </div>
 )

  return (
    <>
    {!getToken && <Canvas src={authBg} /> }
    
    {type === 'signin' ? signinContent : registerContent}
    </>
  )
}

export default AuthForm