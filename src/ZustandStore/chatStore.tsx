import {create} from 'zustand'
import { ChannelType, MessageType } from '../components/types'
const useChatStore = create<{
    // fetchChannels: (user:UserType)=>Promise<void>
    channels:ChannelType[] | [];
    currentChannel: ChannelType | null
    setCurrentChannel: (channel:ChannelType|null)=>void
    setChannels: (channels:ChannelType[])=>void;
    addCurrentChannelMessage: (message:MessageType)=>any
    joinChannel: (channel:ChannelType) =>void
    leaveChannel: (channel_id:string) =>void

    deleteCurrentChannelMessage : (message_id:string)=>void
}>((set,get)=> ({
    channels:[],
    currentChannel:null,
    setCurrentChannel: (currentChannel:ChannelType | null)=>set({currentChannel}),
    setChannels: (channels) =>set({channels}),
    joinChannel: (channel:ChannelType) => set((state)=>({channels: [...state?.channels,channel]})),
    leaveChannel: (channel_id:string) => set((state)=>({channels: state?.channels.filter(channel=>channel._id !== channel_id)})),
    addCurrentChannelMessage: (message:MessageType)=>{
        return set((state:any)=>({currentChannel:{...state.currentChannel,messages:[...state.currentChannel.messages, message]}}))
    },
    deleteCurrentChannelMessage : (message_id:string)=>{
        console.log(`message_id`,message_id)
        return set((state:any)=>({currentChannel:{...state.currentChannel,messages: state.currentChannel.messages?.filter((msg:MessageType)=>msg._id !== message_id)}}))
    }
     
}))

export default useChatStore

