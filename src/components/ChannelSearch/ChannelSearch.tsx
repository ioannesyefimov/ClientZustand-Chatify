import React, { useState } from 'react'
import { searchIco } from '../../assets'
import Channels from '../DashBoard/Channels/Channels'
import FormInput from '../FormInput/FormInput'
import { useSearch } from '../../hooks'
import { useAuthStore, useChatStore } from '../../ZustandStore'
import useSWR from 'swr'
import { APIFetch } from '../utils'
import SearchBar from '../DashBoard/ChannelsBar/SearchBar'
import { ChannelType } from '../types'
const ChannelSearch = () => {
  const [searchedChannels,setSearchedChannels] = useState<ChannelType[]>()
  const serverUrl=useAuthStore(s=>s.serverUrl)
  const fetcher = ()=>APIFetch({url:`${serverUrl}/channels`,method:'get'})
    const {data:channels,isLoading,error}=useSWR('/api/channels',fetcher)

    // const {handleSearchChange} = useSearch()
    

    
  return (
    <div className='channel-search-component'>
         <SearchBar   channels={channels} searchType='CHANNEL' fetchParams={{
                    isFetch:true,
                    url:'channels',
                    swrKey:'/api/channels'
                }} setSearched={setSearchedChannels as React.Dispatch<unknown>}/>
        <Channels fallbackText={`Not found`} type='search' channels={ searchedChannels! ?? channels } />
    </div>
  )
}

export default ChannelSearch