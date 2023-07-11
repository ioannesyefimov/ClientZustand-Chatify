import './Profile.scss'
import Channels from '../DashBoard/Channels/Channels'
import User from '../UserComponent/User'
import { Link } from 'react-router-dom'
import { useAuthStore, useChatStore } from '../../ZustandStore'
import { ChannelType, UserType } from '../types'

const ProfileInformation = ({user,channels}:{user:UserType,channels:ChannelType[]})=>{
    const content = (
        <div className='profile-information'>
            <h3>About acount:</h3>
            <div className="wrapper">
                <p><strong>Profile Email:</strong> {user?.email}</p>
                <p><strong>Profile phone:</strong> {user?.phone ?? 'empty...'}</p>
                <p><strong>Profile Bio:</strong> {user?.bio}</p>
            </div>
            <h4>Channels:</h4>
            <Channels channels={channels!} type='leave' fallbackText='there is no channels yet' /> 
        </div>
    )
    return content
}

const Profile = () => {
    const user = useAuthStore(s=>s.user)
    const channels=useChatStore(s=>s.channels)   
    let content = (
        <div className='profile-component' >
            <div className='wrapper'>
                <Link className='link' to='settings'>Settings</Link>
                <User location='profile'  user={user!} key={user?._id}/>
            </div>
            <ProfileInformation channels={channels! ?? []} user={user}/>
       </div>
    )

    return content
}

export default Profile