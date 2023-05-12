import { ChannelType } from '../types'
import './UserComponent.scss'
import {  useResponseContext } from '../../hooks'
import { Link, useParams } from 'react-router-dom'
import Channel from '../DashBoard/Channel/Channel'
import User from './User'
import NavigationBar from '../NavigationBar/NavigationBar'

import useSWR from 'swr'
import { APIFetch } from '../utils'
import { LoadingFallback } from '../LoadingFallback/LoadingFallback'
import { useAuthStore } from '../../ZustandStore'

const UserComponent = ({locationType}:{locationType?:string}) => {
  let {userId} = useParams()
  console.log(`id`,userId)
  const serverUrl=useAuthStore(s=>s.serverUrl)
  const {setServerResponse}=useResponseContext()
  const fetcher = ()=>APIFetch({url:`${serverUrl}/users/user/${userId}`,method:'GET'})
  const {data,isLoading,error}=useSWR(`/api/users/user/${userId}`,fetcher)

  if(isLoading) return <LoadingFallback/>
  if(error) setServerResponse(error)
  type UserChannelsType = {default?:any,channel:ChannelType,_id:string}
  const showedUser = data?.data?.user
  let userChannels =(
    <div className="user-channels">
      <h4 className='subtitle'>Users channels:</h4>
        {showedUser?.channels ? ( 
           showedUser.channels.map((c:any)=>{
            let channel = c.channel ?? c
            return <Channel id={channel._id!} key={channel._id ?? '13'} name={channel.channelName} avatar={channel.channelAvatar} type='' />
             })
          ): (
          <h4>isn't member of any channels</h4>
          )
        }
      </div>
  )
  let content = (
    <>
      <div className='user-component' >
       <User location={locationType==='user' ? `/user/${showedUser?._id}` : 'profile'} user={showedUser!} key={showedUser?._id}/>
        {userChannels}
      </div>
    </>
  )
  return(
    <>
    <NavigationBar/>
    { 
     showedUser ? 
     
     (
        content
      ) : (
        <div className="user-component">
          <h2>Not Found...</h2>
          <span>Check spelling if you are sure there is such user...</span>
          <Link to="/">Search again</Link>
        </div>
    )}
    </>
  )
} 

export default UserComponent