import React, { SetStateAction, useCallback, useMemo, useState } from 'react'
import { ChannelType, UserType } from '../../components/types'
import { APIFetch, sleep, throwErr } from '../../components/utils'
import {  useResponseContext } from '..'
import { useAuthStore } from '../../ZustandStore'
type SearchedValueType = {
    users?:UserType[]
    channels?:ChannelType[],
    filtered?:ChannelType[] | UserType[] ,
    filteredUsers?:UserType[]
    filteredChannels?:ChannelType[]
}
type HandleSearchType ={
    search:any
    searchType:string
    searchValues?: {
        users?: UserType[]
        channels?:    ChannelType[] 
    }
}
const SEARCH_TYPE: {[index:string]:string} = {
    CHANNELS: 'CHANNELS',
    CHANNEL: 'CHANNEL',
    USERS:'USERS',
    USER:'USER',
    
}


const useSearch = () => {
    const user = useAuthStore(s=>s.user)
    const setLoading = useAuthStore(s=>s.setLoading)
    const serverUrl = useAuthStore(s=>s.serverUrl)
    const [search, setSearch] = useState<any>('')
    const {setServerResponse} =useResponseContext()
    // const [searchedValue,setSearchedValue] = useState<SearchedValueType>(
    //     {
    //         users:[],
    //         channels:[],
    //         filteredChannels:[],
    //         filteredUsers:[],
    //     }
    // )
    // type ResultType = typeof searchedValue
 
    const handleSearch =useCallback(
        async({search,searchType,searchValues}:HandleSearchType) =>{
        try {
            setLoading(true)
            let result:{
                filtered: ChannelType[] | UserType[],
                // users:UserType[]
                // channels: ChannelType[],
                // filteredUsers:UserType[],
            } = {
                filtered:[],
                // users:[],
                // channels:[],
                // filteredChannels:[],
                // filteredChannels:[],
            }
            console.log(`SEARCH:`, search);
            console.log(`type:`,searchType)
            search = search ? search?.toLowerCase() : ''
            switch(searchType){
                // case SEARCH_TYPE.CHANNELS:{
                //     let response = await APIFetch({url:`${serverUrl}/channels`});
                //     if(!response.success) return throwErr(response.message)

                    
                //         console.log(`RESPONSE:`, response);
                //         let filtered = response?.data?.channels?.filter((channel:ChannelType)=>{
                //             if(channel.members.find(member=>member?.member?._id?.includes(user?._id ?? ''))) {
                //                 channel.isJoined = true
                //             }
                //             console.log(`CHANNEL :`, channel);
                //             let name = channel?.channelName?.toLowerCase() 
                //             return name?.includes(search) || channel._id?.includes(search) 
                //         })
                //         if(filtered.length){
                //             result.filtered = filtered 
                //         } else if(!filtered.length && !search) {
                //             result.filtered = []
                //         } else if(!filtered.length ) {
                //             result.filtered = response.data.channels
                //         }
                //         break
                // }
                case SEARCH_TYPE.CHANNEL:{
                    console.log(`searching channgel from `, searchValues?.channels);
                        let filtered = searchValues?.channels?.filter((channel:ChannelType)=>{
                            let name = channel.channelName.toLowerCase() 
                            return name.includes(search)
                        })
                        if(filtered?.length){
                            result.filtered = filtered
                            
                        }else if(!filtered?.length && search===''){
                            result.filtered = searchValues?.channels!
                        }else {
                            result.filtered = []
                        }
                    break
                }
                // case SEARCH_TYPE.USERS: {
                //     let response = await APIFetch({url:`${serverUrl}/auth/user/users`});
                //     if(!response.success) throwErr(response.message)
                //     console.log(`users search response:`, response);
                //     result.users =  Array.isArray(response.data.users) ? response.data.users : [response.data.users]
                //     break
                // }
                case SEARCH_TYPE.USER: {
                    console.log(`SEARCHING FROM `,searchValues?.users);
                    
                    if(!searchValues?.users || !Array.isArray(searchValues.users)) return console.error(`SEARCHED USERS IS `,searchValues?.users) 
                    let filtered = searchValues?.users?.filter((user:UserType)=>{

                        let id = user._id?.toLocaleLowerCase()
                        
                        let username=user.userName.toLocaleLowerCase()
                        
                        let email = user.email.toLocaleLowerCase()
                        
                        if(username.includes(search) || id?.includes(search) || email.includes(search)){
                            return user
                        }
                    })
                        result.filtered = filtered
                    break
                }
                default: {
                     break 
                    }
                }
            return result        
        } catch (error) {
            setServerResponse(error)
        } finally{
            setLoading(false)

        }
            
    },[search])

    const  handleSearchChange = async(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,setSearch:React.Dispatch<SetStateAction<string>>) =>{
       await sleep(500)
        setSearch(e.target.value)
    } 
  return { SEARCH_TYPE,search,handleSearchChange,handleSearch}
}

export default useSearch