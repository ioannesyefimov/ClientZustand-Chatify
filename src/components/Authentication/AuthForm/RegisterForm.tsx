import React, { ChangeEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { profileIco, mailIco, lockerIco, questionIco } from '../../../assets'
import { useResponseContext } from '../../../hooks'
import AuthSocialButtons from '../../AuthButtons/AuthSocialButtons'
import FormInput from '../../FormInput/FormInput'
import { initState } from '../../ProfileComponent/ProfileSettings/settingsReducer'
import { validateInput, APIFetch, throwErr } from '../../utils'
import { useAuthStore } from '../../../ZustandStore'
import Button from '../../Button/Button'
type PropsType = {
  redirectUrl?:string
  redirectType?:string
  type?:string
}
export default function RegisterForm({redirectUrl,redirectType,type}:PropsType) {
    const [form,setForm] = useState(initState)


    const handleFormChange =(e:ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{
      setForm({...form,[e.target.name]:e.target.value})
    }

    const setLoading = useAuthStore(s=>s.setLoading)
    const serverUrl = useAuthStore(s=>s.serverUrl)
    
    const {setServerResponse} = useResponseContext()
    const navigate=useNavigate()
    const EmailRef =React.createRef<HTMLLabelElement>()
    const PasswordRef =React.createRef<HTMLLabelElement>()
    const UserNameRef =React.createRef<HTMLLabelElement>()
  
    const handleSubmit = async(e:React.MouseEvent<HTMLButtonElement, MouseEvent>, type:string)=>{
        e.preventDefault();
    
        try {
          setLoading(true)
         
            let search = new URLSearchParams(location.search)
            if(search.get('redirectUrl')){
              redirectUrl =search.get('redirectUrl') ?? redirectUrl
            }
            let {email,userName,password} = form
            let params = {fields: {email,userName,password},refs:{email:EmailRef,password:PasswordRef,userName:UserNameRef}}
            let isValidInput = await validateInput({fields: params.fields, refs: params.refs});
            if(!isValidInput.success) return 
            let controller = new AbortController() 
            let  signal = controller.signal;
            
            let response = await APIFetch({url:`${serverUrl}/auth/${type}`, method:'POST', body: {...params?.fields,loggedThrough:`INTERNAL`,signal}});
            console.log(`RESPONSE: `, response)
            if(!response?.success) {
              throwErr(response?.err)
            }
          
            if(!response?.data.accessToken) {
              throwErr({name:`SOMETHING WENT WRONG`, arguments: 'accessToken is undefined'})
            }
            if(redirectUrl){
              return navigate(`/auth/redirect/?type=${search.get('redirectType') ?? redirectType}&accessToken=${response?.data?.accessToken}&redirectUrl=${search.get('redirectUrl') ?? redirectUrl}`)
            }
    
    
            if(response?.data?.accessToken){
              navigate(`/auth/redirect/?type=${redirectType}&loggedThrough=INTERNAL&accessToken=${response?.data?.accessToken}`)
            }
            
    
        } catch (error:any) {
          console.error(error);
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
        <FormInput value={form.userName} onChange={(e)=>handleFormChange(e)}
        labelName='Username'
          name='userName'
          id="usernameInput"
          type="text"
          placeholder='Type in your username...'
          ref={UserNameRef}
          photo={profileIco} 
        />
        <FormInput value={form.email} onChange={(e)=>handleFormChange(e)} labelName='email' name="email" id="emailInput" type="email" placeholder='Type in email...' ref={EmailRef} photo={mailIco} />
        <FormInput value={form.password} onChange={(e)=>handleFormChange(e)} name="password" labelName='Password' id="passwordInput" type="password" placeholder='Type in password...' ref={PasswordRef} photo={lockerIco} >
         <Button onHover={showPassword}  img={questionIco} name="show-password" onClick={showPassword}/>
        </FormInput>
        <button className='submit-btn' onClick={(e)=>handleSubmit(e,'register')}>Register</button>
        <AuthSocialButtons authType='signin' />

        </form>
      </div>

  )
}
