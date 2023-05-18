import './channelJoin.scss'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../../DashBoard/ChannelsBar/SearchBar'
import Channels from '../../DashBoard/Channels/Channels'
import Button from '../../Button/Button'
import { backIco, closeIco } from '../../../assets'

import { useChatStore } from '../../../ZustandStore'
import { useState } from 'react'
import { ChannelType } from '../../types'

const ChannelJoin = ()=>{
    const [searchedChannels,setSearchedChannels] = useState<ChannelType[]>()
    const channels = useChatStore( s=>s.channels)
    // const setSearchedChannels = useChatStore( s=>s.setSearchedChannels)
    let navigate = useNavigate()
    return (
        <div className='prompt-menu-component  box-shadow--gray'>
            <Button onClick={()=>navigate(location?.pathname)} type='button' name="close">
                <img src={closeIco} alt="close icon" />
            </Button>
            <Button onClick={()=>navigate(-1)} type='button' name="back">
                <img src={backIco} alt="back icon" />
            </Button>
            <form>
                <SearchBar   channels={channels} searchType='CHANNEL' fetchParams={{
                    isFetch:true,
                    url:'channels',
                    swrKey:'/api/channels'
                }} setSearched={setSearchedChannels as React.Dispatch<unknown>}/>
                <Channels  type="join" fallbackText={`Nothing  was found...`}  channels={searchedChannels!}/>
            </form>
        </div>
    )
}

export default ChannelJoin