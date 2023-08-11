import {create} from 'zustand'
import { ChannelType, MessageType } from '../components/types'
import React, { useRef } from 'react';

const initState = {
    channels:[],
    currentChannel:null,
    currentChannelMessages:[]

}
const useChatStore = create<{
    // fetchChannels: (user:UserType)=>Promise<void>
    channels:ChannelType[] | [];
    currentChannel: ChannelType | null
    setCurrentChannelMessages:(messages:MessageType[])=>any
    messagesCountRef: React.RefObject<HTMLDivElement | undefined>;
    setCurrentChannel: (channel:ChannelType|null)=>void
    setChannels: (channels:ChannelType[])=>void;
    currentChannelMessages:MessageType[]
    addCurrentChannelMessage: (message:MessageType)=>any
    joinChannel: (channel:ChannelType) =>void
    leaveChannel: (channel_id:string) =>void
    scrollToRef:React.RefObject<HTMLDivElement | undefined>;
    deleteCurrentChannelMessage : (message_id:string)=>void
    resetChat:()=>void
}>((set,get)=> ({
    channels:initState.channels,
    currentChannelMessages:initState.currentChannelMessages,
    currentChannel:initState.currentChannel,
    scrollToRef:React.createRef(),
    messagesCountRef:React.createRef(),
    setCurrentChannelMessages:(messages) =>set({currentChannelMessages:messages}),
    setCurrentChannel: (currentChannel:ChannelType | null)=>set({currentChannel}),
    setChannels: (channels) =>set({channels}),
    joinChannel: (channel:ChannelType) => set((state)=>({channels: [...state?.channels,channel]})),
    leaveChannel: (channel_id:string) => set((state)=>({channels: state?.channels.filter(channel=>channel._id !== channel_id)})),
    // addCurrentChannelMessage: (message:MessageType)=>{
    //     return set((state:any)=>({currentChannel:{...state.currentChannel,messages:[...state.currentChannel.messages, message]}}))
    // },
    addCurrentChannelMessage: (message:MessageType)=>{
        return set((state:any)=>({currentChannelMessages:[...state.currentChannelMessages,message]}))
    },
    deleteCurrentChannelMessage : (message_id:string)=>{
        console.log(`message_id`,message_id)
        return set((state:any)=>({currentChannel:{...state.currentChannel,messages: state.currentChannel.messages?.filter((msg:MessageType)=>msg._id !== message_id)}}))
    },
    resetChat: ()=>{set(initState)}

     
}))

export default useChatStore

