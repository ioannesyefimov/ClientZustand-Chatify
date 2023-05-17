import React, { useEffect, useReducer, useRef } from 'react'
import { ChannelType } from '../../../types'
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, useChatStore } from '../../../../ZustandStore';
import { useResponseContext, useUpload, useAuthCookies } from '../../../../hooks';
import Button from '../../../Button/Button';
import FormInput from '../../../FormInput/FormInput';
import UploadInput from '../../../UploadInput/UploadInput';
import { throwErr, Errors, APIFetch, validateInput } from '../../../utils';
import Channel from '../../Channel/Channel';
import channelSettingsReducer,  { ACTIONS, initState } from './channelSettingsReducer';
import './ChannelSettings.scss'
import { settingIco } from '../../../../assets';
function ChannelsSettings() {

  const channel = useChatStore(s=>s.currentChannel)
  const [state,dispatch] = useReducer(channelSettingsReducer,initState);
  const {setServerResponse} = useResponseContext()
    const {file,handleUpload}=useUpload()
    const {cookies,clearState,setCookie} = useAuthCookies()
    const setUser = useAuthStore(s=>s.setUser)
    const navigate =useNavigate()
    const setLoading = useAuthStore(s=>s.setLoading)
    const serverUrl = useAuthStore(s=>s.serverUrl)
    const location = useLocation()
    const channelNameRef= useRef<HTMLLabelElement>()
    const channelDescriptionRef= useRef<HTMLLabelElement>()
    const avatarRef= useRef<HTMLLabelElement>()
  

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
      e.preventDefault(); 
      console.log(`submitting`);
      console.log(`state:`, state);
      
      try {
        setLoading(true)
        let {channelAvatar,channelName,channelDescription,verifiedCredentials}=state
             if( !channelAvatar && !channelName && !channelDescription && !verifiedCredentials)throwErr({name:Errors.MISSING_ARGUMENTS});
  
        let response = await APIFetch({url:`${serverUrl}/channels/change`,method:'POST',body:
          {
            accessToken:cookies?.accessToken,
            updatedParams:state
          }
       })
       console.log(`RESPONSE`, response);
       
  
       if(!response?.success){
         throwErr(response?.err)
       }
       if(response?.data?.accessToken){
        // clearState(`/auth/redirect?type=auth/user&accessToken=${response.data.accessToken}&redirectUrl=/profile&loggedThrough=${response?.data?.loggedThrough}`,navigate)
        setCookie('user',response?.data?.user,{path:'/',maxAge:2000})
        setUser(response?.data?.user)
        // navigate(`/auth/redirect?type=auth/user&accessToken=${response.data.accessToken}&redirectUrl=/profile`)
        navigate(`/profile`)
       }
      } catch (error) {
        console.error(error)
        setServerResponse(error)
      } finally{
        setLoading(false)
      }
  
    }
  
    const handleAvatar = async(e?:React.ChangeEvent<HTMLInputElement>)=>{
      let img= await handleUpload(e);
      return dispatch({type:ACTIONS.SET_CHANNEL_AVATAR, payload:img as string})
    }
    
    
    let content = (
      <div  className="channels-settings-component" >
        <Channel  name={channel.channelName} avatar={channel.channelAvatar} id={channel._id!} type='join' isJoined={true}   />

          <form action="submit" onSubmit={(e)=>handleSubmit(e)}>
              <FormInput  labelName='Channel name' ref={channelNameRef} type='text' name='channelName' id='channelName-input' onChange={(e)=>dispatch({type:ACTIONS.SET_CHANNEL_NAME,payload:e?.target?.value})} value={state.channelName}/>
  
              
              {/* <FormInput labelName=''  ref={bioRef} type='text' name='bio' id='bio-input' onChange={(e)=>dispatch({type:ACTIONS.SET_BIO,payload:e?.target?.value})} value={state.bio}/> */}
              
              <FormInput labelName='Channel Description'  ref={channelDescriptionRef} type='text' name='channelDescription' id='channelDescription-input' onChange={(e)=>dispatch({type:ACTIONS.SET_CHANNEL_DESCRIPTION,payload:e?.target?.value})} value={state.channelDescription}/>
              
              <UploadInput value={state.channelAvatar} ref={avatarRef as React.Ref<HTMLLabelElement>} labelName='channelAvatar'
               onChange={handleAvatar} handleRemoveImg={()=>handleAvatar()} id='channelAvatar' />
              <Button  name='submit-btn' text='submit'  type='submit' />
          </form>
  
  
      </div>
    )
  return content
}

export default ChannelsSettings