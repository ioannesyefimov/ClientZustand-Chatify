import React, { useEffect } from "react";

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AuthSocialButtons from "../AuthButtons/AuthSocialButtons";
import Button from "../Button/Button";
import { Errors, isObj, sleep } from "../utils";
import {  useAuthCookies, useResponseContext } from "../../hooks";
import NavigationBar from "../NavigationBar/NavigationBar";
import { LoadingFallback } from "../LoadingFallback/LoadingFallback";
import { useAuthStore } from "../../ZustandStore";
type ResponseFallbackType ={
    children?:React.ReactNode| React.ReactNode[]

}

 const ServerResponseFallback = ({children}:ResponseFallbackType)=>{
    const {serverResponse,setServerResponse}= useResponseContext();
    const setLoading = useAuthStore(s=>s.setLoading)
    const loading = useAuthStore(s=>s.loading)
    const navigate = useNavigate()
    const location = useLocation()
    const clearState = useAuthCookies().clearState
    let content = (
        <>
        {location.pathname.includes("/auth")  ?  <NavigationBar/> : null}
        {loading && <LoadingFallback />}
        <Outlet/>
        </>
    )
    useEffect(
        ()=>{
            if(serverResponse){
                console.error(serverResponse)
            }
        },[serverResponse]
    )

    useEffect(
        ()=>{
            if(loading){
                sleep(10000).then(()=>{setLoading(false)})
            }
        },[loading]
    )
    if(!serverResponse) {
        return content
    }
    // let handleOnClick = serverResponse?.name === Errors.NOT_A_MEMBER ? ()=>{setServerResponse(null);navigate(`/chat/manage/join?search=${serverResponse?.arguments?.channel_id}`)} : 
    // serverResponse?.message===Errors.JWT_MALFORMED ? (()=>{
    //     clearState('/auth/signin', navigate)
    // }) : serverResponse?.name === Errors.MISSING_ARGUMENTS ? ()=>setServerResponse(null):
    // ()=> {
    //     setServerResponse(null);
    //     navigate("/chat");
    // }
    let handleOnClick =()=>{setServerResponse(null)}


    let btnText = serverResponse?.name === Errors.NOT_A_MEMBER ? 'Join' : serverResponse?.message===Errors.JWT_MALFORMED ? (
        'signin'
    ) : serverResponse?.name === Errors.MISSING_ARGUMENTS  ? 'continue' : isObj(serverResponse?.errors) ? 'fill again' :'reload'

    let responseArguments 
    if(isObj(serverResponse?.arguments)){
        if(typeof serverResponse?.arguments === 'string'){
            responseArguments = <span className='response-type'>{ serverResponse.arguments }</span>
        }else if (typeof serverResponse?.arguments === 'object'){
            responseArguments =  Object.keys(serverResponse?.arguments)?.map((key,i)=>{
                return (
                    <span className='response-type' key={i}>{key}: { serverResponse.arguments[key] }</span>
                )
            })
        }

    } else if (serverResponse?.errors){
        responseArguments = Object.keys(serverResponse?.errors)?.map((error,i)=>{
            return (
                <span className='response-type' key={i}>{error}: {serverResponse.errors[error]}</span>
            )
        })
    }

    let signedUpDifferently = (
        <>
            {responseArguments}
            <AuthSocialButtons authType='signin' socialBtn={serverResponse?.arguments?.loggedThrough ?? ''}/>
     
        </>
    )
    let errorName = serverResponse?.name==='TokenExpiredError' ? 'You need to try to authenticate again' : serverResponse?.name
   
    let displayedMsg = (
        <div className='fallback-component'>
            <div className="inner-wrapper">
                <span className='response-type'>{errorName}</span>
                {serverResponse?.name === Errors.SIGNED_UP_DIFFERENTLY && signedUpDifferently}         
                {responseArguments ?? null}   
            </div>
            <Button onClick={handleOnClick} text={btnText}name='continue-btn' />
        </div>
    ) 
    return <>
        {Object?.keys(serverResponse)?.length ? displayedMsg : null}
        {loading ?? <LoadingFallback/>}
        {content}
    </>

}
export default ServerResponseFallback