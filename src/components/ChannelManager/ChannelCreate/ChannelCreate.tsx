import React, { ChangeEvent, useCallback, useRef, useState } from 'react'
import {FormInput,Button,UploadInput} from '../..'
import { APIFetch, throwErr, validateInput } from '../../utils'
import {  useAuthCookies, useResponseContext, useUpload } from '../../../hooks'
import { ResponseType } from '../../types'
import { useNavigate } from 'react-router-dom'
import { backIco, closeIco } from '../../../assets'

import './ChannelCreate.scss'
import { useAuthStore, useChatStore } from '../../../ZustandStore'

const ChannelCreate = ()=>{
    const [channelName,setChannelName] = useState<string>('')
    const [channelDescription,setChannelDescription] = useState<string>('')
    const [channelAvatar,setChannelAvatar] = useState<string>('')
    const {file,handleUpload}=useUpload()
    const {setServerResponse} = useResponseContext()
    const joinChannel = useChatStore(s=>s.joinChannel)

    const setLoading = useAuthStore(s=>s.setLoading)
    const user = useAuthStore(s=>s.user)
    const serverUrl = useAuthStore(s=>s.serverUrl)
    const {cookies,setCookie} = useAuthCookies()

    const nameRef = useRef<null | HTMLLabelElement >(null)
    const descriptionRef = useRef<null | HTMLLabelElement >(null)
    const avatarRef = useRef<null | HTMLLabelElement >(null)
        const navigate = useNavigate()
    const handleSubmit = 
       async (e:React.MouseEvent)=>{
            e.preventDefault()
            try {
                setLoading(true)
                let fields = {channelName,channelDescription}
                console.log(`FIELDS: `, fields)
                let isEmpty = await validateInput({fields,refs:{channelName:nameRef,channelDescription:descriptionRef}})
                if(!isEmpty?.success){
                    throwErr(isEmpty?.errors)
                }
                // let uploadedPicture = await APIFetch({url:`${serverUrl}/upload/picture`, body:{image:channelAvatar,accessToken:cookies?.accessToken}})
                let response:ResponseType = await APIFetch({url:`${serverUrl}/channels/create`, body:{userEmail:user.email, accessToken:cookies?.accessToken,channelName,channelAvatar:file,channelDescription},method:'POST'})
                if(!response?.success) throwErr(response?.err)
                // let updatedUser = JSON.stringify({...user,channels:response?.data.channels})
                setCookie('user',response?.data?.user,{path:'/',maxAge:2000})
                if(!response?.success) throwErr(response?.err)
                setCookie('user',response?.data?.user,{path:'/',maxAge:2000})
                setCookie('channels',response?.data?.channels,{path:'/',maxAge:2000})
                joinChannel(response?.data?.channel)
                navigate(`/chat/${response?.data?.channel._id}`)
            } catch (error) {
                console.log(`ERROR:`,error)
                return setServerResponse(error)
            }finally{
                setLoading(false)

            }
        }

        const handleImage = async(e:ChangeEvent<HTMLInputElement>)=>{
            if(e.target.files){
                let img = await handleUpload(e);
                return setChannelAvatar(img as string) 
            }
        }
    
    const handleRemoveImg = useCallback(
        ()=>{
            handleUpload()
            console.log(`removing` );
            
        },[]
    )
    return (
        <div className='prompt-menu-component '>
            <Button onClick={()=>navigate(-1)} type='button' name="close">
                <img src={closeIco} alt="close icon" />
            </Button>
            <Button onClick={()=>navigate('/chat/manage')} type='button' name="back">
                <img src={backIco} alt="back icon" />
            </Button>
            <form action="">
                <FormInput textArea={{rows:"2",cols:"40"}} ref={nameRef} labelName='Channel Name:' value={channelName} onChange={(e)=>{setChannelName(e.target.value)}}  type='text' placeholder={`type in channel's name`} name="name"id="channel-name"/>
                
                <FormInput textArea={{rows:"3",cols:"40"}} ref={descriptionRef} labelName='Channel description:' value={channelDescription} onChange={(e)=>{setChannelDescription(e.target.value)}}  type='text' placeholder={`type in channel's description`} name="description"id="channel-description"/>
            
                <UploadInput handleRemoveImg={handleRemoveImg} value={file} ref={avatarRef} labelName='Channel Avatar:' id="image-input" onChange={handleImage}/>
                <Button text='Create' name='submit-btn' onClick={handleSubmit}/>
            </form>
        </div>
    )
}

export default ChannelCreate