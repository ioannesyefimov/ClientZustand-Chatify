import React, { ChangeEvent, useState } from 'react'
import { mailIco, lockerIco, questionIco } from '../../../assets'
import AuthSocialButtons from '../../AuthButtons/AuthSocialButtons'
import FormInput from '../../FormInput/FormInput'
import { initState } from '../../ProfileComponent/ProfileSettings/settingsReducer'
import { useResponseContext } from '../../../hooks'
import { validateInput, APIFetch, throwErr } from '../../utils'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../ZustandStore'
import Button from '../../Button/Button'
type PropsType = {
    redirectUrl?:string
    redirectType?:string
    type?:string
    getToken?:boolean
}
export default function SigninForm({redirectUrl,redirectType,type,getToken}:PropsType) {
    const [form,setForm] = useState(initState)


    const handleFormChange =(e:ChangeEvent<HTMLInputElement>)=>{
      setForm({...form,[e.target.name]:e.target.value})
    }

    const setLoading = useAuthStore(s=>s.setLoading)
    const serverUrl = useAuthStore(s=>s.serverUrl)
    
    const {setServerResponse} = useResponseContext()
    const navigate=useNavigate()

    const EmailRef =React.createRef<HTMLLabelElement>()
    const PasswordRef =React.createRef<HTMLLabelElement>()

    const handleSubmit = async(e:React.MouseEvent<HTMLButtonElement, MouseEvent>, type:string)=>{
        e.preventDefault();

        try {
        setLoading(true)
        
        // let search = new URLSearchParams(location.search)
        let {email,password} = form
        let params = {fields: {email,password},refs:{email:EmailRef,password:PasswordRef}}
        let isValidInput = await validateInput({fields: params.fields, refs: params.refs});
        if(!isValidInput.success) return 
        let controller = new AbortController() 
        let  signal = controller.signal;
        
        let response = await APIFetch({url:`${serverUrl}/auth/${type}`, method:'POST', body: {...params?.fields,loggedThrough:`INTERNAL`,signal}});
        console.log(`RESPONSE: `, response)
        if(!response?.success || !response?.data?.accessToken) {
        throwErr(response?.err)
        }
        
        if(!response?.data.accessToken) {
        throwErr({name:`SOMETHING WENT WRONG`, arguments: 'accessToken is undefined'})
        }
        if(redirectUrl && getToken){
        return navigate(`/auth/redirect/?type=${redirectType}&accessToken=${response?.data?.accessToken}&redirectUrl=${redirectUrl}&getToken=${getToken}`)
        }


        if(response?.data?.accessToken){
        navigate(`/auth/redirect/?type=${redirectType ?? 'auth/user'}&loggedThrough=INTERNAL&accessToken=${response?.data?.accessToken}`)
        }
        

        } catch (error:any) {
        setServerResponse(error)
        } finally{
        setLoading(false)
        }
    
  }


  const showPassword  = ()=>{
     ()=>{
        let passwordRef = document.getElementById('password') as HTMLInputElement
        console.log(`password INPUT : `,passwordRef);
    
        if(passwordRef.type==='password'){
            passwordRef.type = 'text'
        } else if(passwordRef.type==='text'){
            passwordRef.type='password'
        }  
    }
}
  return (
        <div className="input-wrapper">
            <form action="submit">
            <FormInput value={form.email} onChange={(e)=>handleFormChange(e)} labelName='email' name="email" id="emailInput" type="email" placeholder='Type in email...' ref={EmailRef} photo={mailIco} />
            <FormInput value={form.password} onChange={(e)=>handleFormChange(e)} name="password" labelName='Password' id="passwordInput" type="password" placeholder='Type in password...' ref={PasswordRef} photo={lockerIco}>
            <Button onHover={showPassword}  img={questionIco} name="show-password" onClick={showPassword}/>
                 </FormInput>
            
            <button className='submit-btn' onClick={(e)=>handleSubmit(e, 'signin')}>Signin</button>
            
            <AuthSocialButtons authType='signin' redirectUrl={redirectUrl} />
            </form>
         </div> 
        )
}
