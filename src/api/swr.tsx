import { useAuthStore } from "../ZustandStore"
import { APIFetch } from "../components/utils"


export const MessagesRoute = '/messages'
export const MessagesFetcer = (id:string,email:string,url:string)=>{
    console.log(`email :`,email);
    console.log(`channel ID:`,id);
    
    return APIFetch({url:`${url}/messages/getMessages?channel_id=${id}&user_email=${email}`,method:'GET'})
}