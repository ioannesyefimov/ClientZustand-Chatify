import {  useEffect, useState } from 'react'
import {  useGithub, useResponseContext } from '../../hooks'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthCookies from '../../hooks/useAuthCookies/useAuthCookies'
import { APIFetch, Errors, sleep, throwErr } from '../utils'
import { ChannelType, UserType } from '../types'
import './RedirectComponent.scss'
import { useAuthStore } from '../../ZustandStore'
import useSWR from 'swr'
import { LoadingFallback } from '../LoadingFallback/LoadingFallback'
type StateType = {
    user:UserType | null,accessToken:string|null
    redirect: string | null
    channels?:ChannelType[] | null
}

let initDataState = {user:null,accessToken:null,redirect:null,channels:null}
type HandleLoginProps = {
    accessToken: string
    type: string
    loggedThrough: string
    signal?: AbortSignal
    redirectUrl:string | null
}
const RedirectComponent = () => {
    const {loading,serverUrl}=useAuthStore()
    const {handleGitHubLogin}=useGithub('')
    const {setCookie} = useAuthCookies()
    const {setServerResponse} = useResponseContext() 
    let location = useLocation()
    let navigate = useNavigate()
    const fetcher = async function handleRedirect() {
        let query = new URLSearchParams(location.search)
        let type = query.get('type')
        let loggedThrough = query.get('loggedThrough')
        let accessToken = query.get('accessToken')
        let code = query.get("code")
        let redirectUrl = query.get("redirectUrl")
        await sleep(2000);
        if(code){
            return  handleGitHubLogin(code);
        }
        console.log(`type: ${type}`)
        console.log(`loggedThrough: ${loggedThrough}`)
        console.log(`accessToken: ${accessToken}`)

        if(type && loggedThrough && accessToken){
            console.log(`LOGGIN IN`);
            
            return APIFetch({setError:setServerResponse, url:`${serverUrl}/${type}?accessToken=${accessToken}&loggedThrough=${loggedThrough}`, method:'get'})
        }else {
            return new Promise<void>((resolve, reject) => {
                return reject(Errors?.MISSING_ARGUMENTS)
            })
        }
    }
    const {data,isLoading,error}=useSWR(location?.search ? `/api/auth/user`:null , fetcher)


    
    //   let handleRedirect = 
    //     async(signal:AbortSignal,token?:string)=>{
    //         try {
    //             setLoading(true)
    //             let query = new URLSearchParams(location.search)
    //             let type = query.get('type')
    //             let loggedThrough = query.get('loggedThrough')
    //             let accessToken = query.get('accessToken')
    //             let code = query.get("code")
    //             let redirectUrl = query.get("redirectUrl")
    //             if(signal.aborted) return
    //             await sleep(2000);
    //             if(code){
    //                 return await handleGitHubLogin(code,signal);
    //             }
    //             console.log(`type: ${type}`)
    //             console.log(`loggedThrough: ${loggedThrough}`)
    //             console.log(`accessToken: ${accessToken}`)
    //             if(!accessToken) {
    //                 throwErr({name:Errors.MISSING_ARGUMENTS,arguments:'accessToken'})
    //             }
    //             if(!type) throwErr({name:Errors.MISSING_ARGUMENTS,arguments:'type'})
    //             // setCookies('accessToken', accessToken, {path:'/',maxAge: 2000})
    //             if(type==='newAccessToken'){
    //                 let redirect = query.get('redirectUrl')!
    //                 navigate(redirect)
    //                 console.log(`REDIRECTION to ${redirect}`)
    //                 return false
    //             }
    //             if(type && loggedThrough && accessToken){
    //                return handleLogin({accessToken,type,loggedThrough,signal,redirectUrl});
    //             }
    //         } catch (error:any) {
    //             setServerResponse(error)
    //         }
    // }
    // useEffect(
    //     ()=>{
    //         if(!location.search)return 
    //         let controller = new AbortController()
    //         let {signal} = controller
    //         handleRedirect(signal)
    //     },[location.search])

    useEffect(
        ()=>{
            if(data?.data?.user){
                setCookie('user',data?.data?.user,{path:'/',maxAge:2000})
                navigate('/chat')
            }
            if(data?.data?.accessToken){
                setCookie('accessToken',data?.data?.accessToken,{path:'/',maxAge:2500})
            }
            if(data?.data?.channels){
                setCookie('channels',data?.data?.channels,{path:'/',maxAge:2000})
            }
            if(data?.data?.redirectUrl){
                navigate(data?.data?.redirectUrl)
            }
        },[data]
    )
        
    
    return (
    <div className='redirect-component'>
        {isLoading && <LoadingFallback/>}
        <Link to='/chat' replace>Home</Link>
    </div>
    )

}

export default RedirectComponent