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
const RedirectComponent = () => {
    const {loading,serverUrl}=useAuthStore()
    const {handleGitHubLogin}=useGithub('')
    const {setCookie} = useAuthCookies()
    const {setServerResponse} = useResponseContext() 
    const setUser = useAuthStore(s=>s.setUser)
    let location = useLocation()
    const fetcher = async function handleRedirect() {
        let query = new URLSearchParams(location.search)
        let type = query.get('type')
        let loggedThrough = query.get('loggedThrough')
        let accessToken = query.get('accessToken')
        let code = query.get("code")
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
    useEffect(
        ()=>{
            sleep(2000).then(()=>{console.log()})
            if(data?.data?.user){
                setCookie('user',data?.data?.user,{path:'/',maxAge:2000})
                setUser(data?.data?.user)
                // navigate('/chat')
            }
            if(data?.data?.accessToken){
                setCookie('accessToken',data?.data?.accessToken,{path:'/',maxAge:2500})
            }
            if(data?.data?.channels){
                setCookie('channels',data?.data?.channels,{path:'/',maxAge:2000})
            }
        },[data]
    )
    useEffect(
        ()=>{
            if(error){
                console.log(`registration ERROR:`,error);
            }

        },[error]
    )
    
    const content = (
        <div className='redirect-component'>
            {isLoading ? <LoadingFallback/> : (
                <Link to='/chat' replace>Home</Link>
            )}
        </div>
        )
    
    return content

}

export default RedirectComponent