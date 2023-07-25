import React, { useEffect } from 'react'
import ReactFacebookLogin, { ReactFacebookFailureResponse, ReactFacebookLoginInfo } from 'react-facebook-login';
import { useAddScript, useResponseContext } from '../index';
import { Errors,APIFetch, throwErr } from '../../components/utils';
import useFetch from '../useFetch';
import { useNavigate } from 'react-router-dom';
import useAuthCookies, { useCookiesData } from '../useAuthCookies/useAuthCookies';
import { useAuthStore } from '../../ZustandStore';

const useFacebook = (loginType:string,redirectUrl:string|undefined) => {
  useAddScript({id: 'facebookAuth',src:'https://connect.facebook.net/en_US/sdk.js', text:''})

    const {setServerResponse} = useResponseContext()
    const serverUrl = useAuthStore(s=>s.serverUrl)
    const setLoading = useAuthStore(s=>s.setLoading)
    const {handleDelete} = useFetch()
    const {cookies,clearState} = useAuthCookies()
    const navigate = useNavigate()
   
    useEffect(
        ()=>{
            const initFacebook = async()=>{
                try {
                    let FB = (window as any).FB
                    let btn = document.getElementById('facebookBtn') as HTMLButtonElement
                    if(!btn)return
                    btn.disabled = true
                    if(FB){
                        console.log(`initializing facebook oauth`);
                        
                        const params = {
                            appId: import.meta.env.VITE_APP_FACEBOOK_APP_ID,
                            cookies: false,
                            xfbml: true,
                            version: 'v16.0'
                        }
    
                        FB?.init(params);
                         FB?.getLoginStatus((resp:ReactFacebookFailureResponse)  =>{
                            console.log(`FB:status==: ${resp.status}`)
                            if(resp.status==='connected'){
                                
                                return cookies?.accessToken ? navigate(`/auth/redirect/?accessToken=${cookies?.accessToken}&loggedThrough=Facebook&type=auth/user`) : console.log(`token is ${cookies?.accessToken}`)
                            }
                        })
                        btn.removeAttribute('disabled')
                    }
                } catch (error:any) {
                    console.error(error?.name, ':', error?.message)
                    
                }
            }
            let timeout = setTimeout(initFacebook,1500)

            return ()=>clearTimeout(timeout)
        }, [window]
    )
    const handleFacebookLogin = async({credentials}:{credentials:any}) =>{
        try {
            setLoading(true)
            setServerResponse(null)
            console.log(`FB LOGGIN IN`)
            const response = await APIFetch({url: `${serverUrl}/auth/facebook`, method:'POST', body: {credentials}});
            console.log(response)
            if(!response.success){
                throwErr({message: response?.message, loggedThrough:response?.loggedThrough})
            } 
            if(redirectUrl){
                console.log(`REDIRECT ULR : ${redirectUrl}`)
                navigate(`/auth/redirect?type=newAccessToken&accessToken=${response?.data.accessToken}&redirectUrl=${redirectUrl}`)
                return 
            }
                navigate(`/auth/redirect?type=auth/user&accessToken=${response?.data?.accessToken}&loggedThrough=Facebook`)
        } catch (error) {
               setServerResponse( error)
        } finally {
            setLoading(false)
        }
    }

    const onSuccess = async(response:ReactFacebookLoginInfo, type:string)=>{
        try {
            if(response?.email){
                return type === 'delete' ?
                await handleFacebookDelete( response)
                :  
                await handleFacebookLogin({credentials: response})
            }
        } catch (error) {
             setServerResponse(error)
        }
    }
    const handleFacebook = async(type:string) => {

        try {
            setLoading(true)
            let FB = (window as any).FB
            if(FB){

                const params ={
                    provider: 'facebook',
                    fbAccessToken:''
                }; 
                console.log(`FACEBOOK HANDLING`)
    
                FB.getLoginStatus((resp:any)=>{
                    console.log(`FB:status: ${resp.status}`)
                    if(resp.status === 'connected'){
                        params.fbAccessToken = resp.authResponse.accessToken 
                        FB.api('/me', (response:any)=>{
                            console.log(`successful login for: ${response?.name}`)
                            console.log(`RESPONSE:` ,response)
                        });
                    }
                });
    
               
                    
                FB.login((resp:any)=>{
                    console.log(`FB RESP`, resp);
                    
                    if(resp.authResponse){
                        params.fbAccessToken = resp.authResponse.accessToken
                        FB.api(
                            '/me',
                            'GET',
                            {"fields":"about,email,name,picture"},
                            (response:any)=>{
                                console.log(response)
                                console.log(`GOOD to see you, ${response?.name}.`)
                                console.log(`type: ${type}`)
                                onSuccess(response, type)
                            });
                            
                        
                    } else {
                        console.log('User cancelled login or did not fully authorize.');
                       }
                }, {scope: 'public_profile,email'});
                console.log(params)
    
                
            } else {
                return console.log('FACEBOOK SCRIPT WAS NOT ADDED')
            }
        } catch (error) {
            console.log(error)
            return {message:error,success:false}
        } finally{
            setLoading(false)
        }
        


    }
    const handleFacebookDelete = async(credentials:any)=>{
        try {
            console.log(`credentials: `, credentials);
            if(!credentials) throwErr({message:Errors.MISSING_ARGUMENTS})
            setLoading(true)
            let params = new URLSearchParams(credentials)
            const response = await APIFetch({url: `${serverUrl}auth/facebook?credentials=${params}`, method:'DELETE', body: {credentials}});
            console.log(`deleting facebook`)
            console.log(response)
            if(!response.success){
                clearState('')
                throwErr({message: response?.message, loggedThrough:response?.loggedThrough})
            }

         
            let  deleteUser =await handleDelete({accessToken: response?.data?.accessToken, user: credentials, deletedThrough: 'Facebook'});
            if(!deleteUser?.success) throwErr({message: deleteUser.message});

            clearState('')
              
        } catch (error) {
            return setServerResponse({message: error})
        } finally{
            setLoading(false)
        }
    }


    return {handleFacebookDelete, handleFacebook}
}

export default useFacebook
