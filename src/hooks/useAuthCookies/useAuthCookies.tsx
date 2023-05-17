
import React, { useContext } from 'react'
import { Cookies, useCookies } from 'react-cookie'
import { ChannelType, UserType } from '../../components/types'
import { useAuthStore } from '../../ZustandStore'
import { NavigateFunction } from 'react-router-dom'
import { useSWRConfig } from 'swr'
export type CookiesType = {
  user: UserType
  accessToken:string,
  refreshToken:string
  channels:  ChannelType[]
}

export const useCookiesData = ()=>useAuthCookies().cookies
export const useSetCookies = ()=>useAuthCookies().setCookie
export const useRemoveCookies = ()=>useAuthCookies().removeCookie

const useAuthCookies = () => {

  const [cookies,setCookie,removeCookie]= useCookies<'user'|'accessToken'|'refreshToken'|'channels', CookiesType
    >(['user' ,'accessToken','refreshToken',"channels"])
  const setUser = useAuthStore.getState().setUser
  const user = useAuthStore.getState().user
  const setOnlineUsers =  useAuthStore.getState().setOnlineUsers
  const onlineUsers =  useAuthStore.getState().onlineUsers
  const {cache}=useSWRConfig()
  const clearState =(replace:string, navigate?:NavigateFunction) => {
  
  console.log('CLEARNING STATE')

  setUser({userName:'',email:'',_id:'',channels:[]})

  
  
  removeCookie('accessToken', {path:'/'})
  removeCookie('refreshToken', {path:'/'})
  removeCookie('channels', {path:'/'})
  removeCookie('user', {path:'/'})
  if(!replace){
    console.log(`not replacing`)
  }else if(navigate !== undefined){
    navigate(replace)
  } else if(replace && navigate===undefined)  {
      window.location.replace(replace)
  }
  window.localStorage.clear()
  cache.delete('/api/auth/user')
  cache.delete('/api/channels/userChannels')
  setOnlineUsers(onlineUsers?.filter(loggedOutUser=>loggedOutUser.userId !== user?._id))
}
  return {cookies,setCookie,removeCookie,clearState}
}

export default useAuthCookies