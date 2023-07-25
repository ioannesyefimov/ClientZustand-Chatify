import React from 'react'
import AuthForm from '../Authentication/AuthForm/AuthForm'
type PropsType ={
    redirect:string
    redirectType:string
}
export default function PromptLogin({redirect,redirectType}:PropsType) {
  return (
    <div className='prompt-component'>
        <h3>You need to log in again</h3>
            <AuthForm type="signin" getToken={true} redirectType={redirectType} redirectUrl={redirect}/>
    </div>
  )
}
