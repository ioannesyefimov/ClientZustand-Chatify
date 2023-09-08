import {create} from 'zustand'
import { ChannelType, MessageType } from '../components/types'
import React, { useRef } from 'react';

const initState = {
    channels:[],
    currentChannel:null,
    currentChannelMessages:[]

}
type SortedStateType = {
    [index:number | string]: MessageType[] |undefined  
  }
  
const useChatStore = create<{
    // fetchChannels: (user:UserType)=>Promise<void>
    channels:ChannelType[] | [];
    sortedMessages:SortedStateType 
    currentChannel: ChannelType | null
    currentChannelMessages:MessageType[] | undefined
    messagesCountRef: React.RefObject<HTMLDivElement | undefined>;
    scrollToRef:React.RefObject<HTMLDivElement | undefined>;
    setSortedMessages:(sortedMessages:SortedStateType)=>any
    setCurrentChannel: (channel:ChannelType|null)=>void
    setCurrentChannelMessages:(messages:MessageType[])=>void
    setChannels: (channels:ChannelType[])=>void;
    addCurrentChannelMessage: (message:MessageType)=>any
    joinChannel: (channel:ChannelType) =>void
    leaveChannel: (channel_id:string) =>void
    deleteCurrentChannelMessage : (message_id:string)=>void
    resetChat:()=>void
}>((set,get)=> ({
    channels:initState.channels,
    currentChannel:initState.currentChannel,
    scrollToRef:React.createRef(),
    messagesCountRef:React.createRef(),
    sortedMessages: {},
    currentChannelMessages:undefined,
    setCurrentChannelMessages:(messages:MessageType[])=>set({currentChannelMessages:messages}),

    setSortedMessages:(sortedMessages)=>set({sortedMessages}),
    setCurrentChannel: (currentChannel:ChannelType | null)=>set({currentChannel}),
    setChannels: (channels) =>set({channels}),
    joinChannel: (channel:ChannelType) => set((state)=>({channels: [...state?.channels,channel]})),
    leaveChannel: (channel_id:string) => set((state)=>({channels: state?.channels.filter(channel=>channel._id !== channel_id)})),
    addCurrentChannelMessage: (message:MessageType)=>{
        return set((state:any)=>({currentChannelMessages:[...state.currentChannelMessages, message]}))
    },
    // deleteCurrentChannelMessage : (message_id:string)=>{
    //     console.log(`message_id`,message_id)
    //     return set((state:any)=>({currentChannelMessages:[...state.currentChannelMessages, state.currentChannel.messages?.filter((msg:MessageType)=>msg._id !== message_id)]}))
    // },
    deleteCurrentChannelMessage : (message_id:string)=>{
        console.log(`message_id`,message_id)
        return set((state:any)=>({currentChannelMessages:[...state.currentChannelMessages, state.currentChannelMessages?.filter((msg:MessageType)=>msg._id !== message_id)]}))
    },
    resetChat: ()=>{set(initState)}

     
}))

export default useChatStore

