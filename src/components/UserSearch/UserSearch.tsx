import React, {  useCallback, useEffect, useState } from 'react'
import './UserSearch.scss'
import { UserType } from '../types'
import { APIFetch, sleep } from '../utils'
import {  useDebounce, useSearch } from '../../hooks'
import User from '../UserComponent/User'
import { Link } from 'react-router-dom'
import { searchIco } from '../../assets'
import FormInput from '../FormInput/FormInput'
import useSWR from 'swr'
import { LoadingFallback } from '../LoadingFallback/LoadingFallback'
import { useAuthStore } from '../../ZustandStore'


const UserSearch = () => {
    const [search,setSearch]=useState('')
    const serverUrl = useAuthStore(s=>s.serverUrl)
    let fetcher = ()=>APIFetch({url:`${serverUrl}/users`,method:'GET'})
    const {data:users,isLoading,error}=useSWR('/api/auth/users',fetcher)
    const [showedUsers,setShowedUsers]=useState<UserType | UserType[]>()
    const {handleSearch} = useSearch()

    const debouncedValue = useDebounce({value:search,delay:500})

    const initSearch = useCallback(
        async ()=>{
            if(debouncedValue){
                let result =await  handleSearch({search:debouncedValue,searchType:'USER',searchValues: {users:users?.data?.users}})
                console.log(`result`,result);
                
                setShowedUsers(result?.filtered as UserType[])
            } else if (!debouncedValue) {
                setShowedUsers(users?.data?.users)
            }
        },[debouncedValue,users]
    )
    useEffect(
        ()=>{
           initSearch()
        },[debouncedValue,users]
    )
    // useEffect(
    //     ()=>{
    //         console.log(`SEARCHED:`, searchedValue);
            
    //         if(searchedValue?.filtered?.length){
    //             setShowedUser(searchedValue.filtered as UserType[])
    //         } else
    //         if(searchedValue.users){
    //             setShowedUser(searchedValue.users)
    //         }
           
    //     },[searchedValue]
    // )


    if(isLoading)return <LoadingFallback/>

    let mappedUsers = (showedUsers as UserType[])?.map((user:UserType)=>{
        return <User location='search'  user={user}/>
    })
    let content = (
        <div className='member-info'>  
       <FormInput name='search' id="searchInput" placeholder='Search' photo={searchIco} type='text' onChange={(e)=>setSearch(e.currentTarget.value)} value={search} />
        <div className='users-wrapper'>
        {mappedUsers}      
        </div>
        </div>
    )
                

    return content
  

}

export default UserSearch