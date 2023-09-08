import { Dispatch, SetStateAction } from "react";
import { useAuthStore } from "../ZustandStore"
import { HandleClickType } from "../components/MessagesWrapper/Context/MessagesContext";
import { ChannelType, UserType } from "../components/types";
import { APIFetch, createDate } from "../components/utils"
import { channelSocket } from "../hooks/useCurrentChannelContext/useCurrentChannel";


export const MessagesRoute = '/messages'
export const MessagesFetcer = (id:string,email:string,url:string)=>{
    console.log(`email :`,email);
    console.log(`channel ID:`,id);
    
    return APIFetch({url:`${url}/messages/getMessages?channel_id=${id}&user_email=${email}`,method:'GET'})
}

