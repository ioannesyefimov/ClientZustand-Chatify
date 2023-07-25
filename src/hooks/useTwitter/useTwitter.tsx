import React, { useEffect } from 'react'
import { useAuthCookies, useResponseContext} from '../index'
import { APIFetch, throwErr } from '../../components/utils'
import useFetch from '../useFetch'
import { useAuthStore } from '../../ZustandStore'

const useTwitter = (loginType:string) => {
    const {setServerResponse} = useResponseContext()
    const {clearState,setCookie} = useAuthCookies()
    const setLoading = useAuthStore(s=>s.setLoading)    
    const url = `http://localhost:5050/api/auth/`

    const TWITTER_AUTH_URL = ``
    const TWITTER_SCOPE = ['tweet.read','users.read','offline.access'].join('')
    const TWITTER_STATE = `twitter-increaser-state`
    const TWITTER_CODE_CHALLENGE = `challenge`
    const redirectUri = 'https://authentic-app.netlify.app/auth/signin/profile'
    const handleTwitterDelete = async() =>{
        console.log('TWITTER DELETING')
    }

    useEffect(
        ()=>{
            let btn = document.getElementById('twitterBtn') as HTMLButtonElement
            if(!btn) return 
            btn.disabled = true
        },[]
    )
  

    const handleTwitterLogin = async({credentials,type}:any) =>{
        try {
            setLoading(true)
            console.log(`FB SIGNIN IN`)
            const response = await APIFetch({url: `${url}auth/twitter`, method:'POST', body: {credentials}});
            console.log(response)
            if(!response.success){
                clearState('')
                throwErr({message: response?.message, loggedThrough:response?.loggedThrough})
            }
            
            setCookie('accessToken', response?.data?.accessToken, {path: '/', maxAge: 2000})
            // setReload(prev=>prev+1)
            localStorage.setItem('LOGIN_TYPE', 'signin')
            // window.location.reload()

        } catch (error) {
            setServerResponse(error)

        } finally {
            setLoading(false)
        }
    }


    const handleTwitter = (type:string) => {
        setServerResponse({message: 'UNAVAIBLE'})
        return 
        // can't access developer account on twitter, so left it 
        // getUrlWithQueryParams(TWITTER_AUTH_URL, {
        //     response_type:'code',
        //     client_id: import.meta.env.VITE_APP_TWITTER_CLIENT_ID,
        //     redirect_uri: redirectUri,
        //     scope:TWITTER_SCOPE,
        //     state: TWITTER_STATE,
        //     code_challenge: TWITTER_CODE_CHALLENGE,
        //     code_challenge_method: 'plain,'

        // })
        console.log(type)


    }


 
    return {handleTwitter,handleTwitterDelete}
}

export default useTwitter