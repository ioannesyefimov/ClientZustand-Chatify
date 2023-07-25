import {  useAuthCookies, useResponseContext } from './index'
import {HandleFetchProps } from '../components/types';
import { APIFetch, throwErr } from '../components/utils/index';
import { convertBase64} from '../components/utils/index';
import { useCallback } from 'react';
import { useAuthStore } from '../ZustandStore';





const useFetch = () => {
    const {setCookie,clearState} = useAuthCookies()
    const {setServerResponse}= useResponseContext()
    const setLoading = useAuthStore(s=>s.setLoading)
    const serverUrl =useAuthStore(s=>s.serverUrl)
   const getUserData= useCallback(async(accessToken:string, loggedThrough:string | null) =>{
     try {
      setLoading(true)
      const response = await APIFetch({
        url: `${serverUrl}auth/user`,
        method: 'POST', 
        body: {
        accessToken: accessToken,
        loggedThrough: loggedThrough
        }})

        if(!response?.success ){
          clearState('')
           throwErr({message:response.message, loggedThrough:response?.loggedThrough})
           return
        }
        // console.log(response)
        if(response?.data.user){

            const user = {
                fullName: response?.data.user.fullName,
                email: response?.data.user.email,
                picture: response?.data.user.picture,
                bio: response?.data.user?.bio,
                phone: response?.data.user?.phone,
                loggedThrough: response?.data?.loggedThrough
            }

            localStorage.setItem('LOGGED_THROUGH', response?.data?.loggedThrough)
            // console.log(`GETTING USER `)

            setCookie('user',user ,{path: '/', maxAge: 2000})
            if(response?.data.accessToken){
              setCookie('accessToken', response?.data.accessToken,{path: '/', maxAge: 2000})
            }
      

            // window.localStorage.clear()
        }

    } catch (error) {
      setServerResponse({message:error})
    } finally {
      setLoading(false)

    }
  }, [])
    
  const uploadPicture = async (file:File,accessToken:string) => {
   
    // const file = event.target.files[0]
    const base64 = await convertBase64(file)
    

        // 👇 Uploading the file using the fetch API to the server
     const upload = await fetch(`${serverUrl}/upload/picture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            image: base64,
            accessToken: accessToken
          }),
        })

      const uploadResponse = await upload.json()
        return uploadResponse?.success ? (
          {url: uploadResponse?.data?.url}
        ) : (
          {message: uploadResponse?.message}
        )

    }
  const handleDelete = async({data, user, accessToken,deletedThrough}:HandleFetchProps) =>{

    let email = data?.get('email')
    let password = data?.get('password')
    // console.log(email);
    // console.log(password);
    // console.log(`token DELETING:`, accessToken)
    try {
      // console.log(`handleDelete IS WORKING`)
      if(email && password){
        let dbDelete = await APIFetch({url: `${serverUrl}change/delete`, method:'delete', body: {userEmail: user?.email,updatedParams:{password}, accessToken}})

        if(!dbDelete?.success) return {success:false, message:dbDelete?.message}
        return dbDelete
      } else
      if(accessToken !=='undefined' || accessToken !== undefined && !password ){
        // console.log(`DELETING THROUGH ACCESS-TOKEN`)
        
        let dbDelete = await APIFetch({url: `${serverUrl}change/delete`, method:'delete', body: {userEmail: user?.email, accessToken, deletedThrough}})

        // console.log(dbDelete)
        if(!dbDelete?.success) 
        {
          return {success:false, message:dbDelete?.message}
        }
        return {success:true, message:dbDelete?.message}
      }

    } catch (error) {
      return {success:true, message:error}

    } finally{
      setLoading(false)
    }

  }

  const handleChangeFetch = useCallback(async ({data,user, accessToken}:HandleFetchProps) => {
  // change users information.
  console.log(user);
  let email = data?.get('email')
  let fullName = data?.get('name')
  let bio = data?.get('bio')
  let phone = data?.get('phone')
  let password = data?.get('password')
  let picture = data?.get('picture')
  let changesArr:any ={}
  // console.log(`data: `, data)
  try {
    setLoading(true)
    //add updatedParams if they have been added by user
    if(picture){
    let uri = await convertBase64(picture as File);
    // console.log(`uri: `,uri);
      changesArr.picture = uri
    //  console.log(`picture is added`);
    }
    if(email) 
    {
      // console.log(`email is added`);
      changesArr.email = email
    }
    if(fullName)
    {
      // console.log(`fullName is added`);
      changesArr.fullName = fullName
    }
    
    if(bio) 
    {
      // console.log(`bio is added`);
      changesArr.bio = bio
    }
    if(phone) 
    {
      // console.log(`phone is added`);
      changesArr.phone = phone
    }
    if(password)
    {
      // console.log(`password is added`);
      changesArr.password = password
    }
    // send request to change user's information

    // console.log(`is going to send response`)
    let response = await APIFetch({url: `${serverUrl}change`, method:'post', body: {updatedParams: changesArr, userEmail: user?.email, accessToken}});
    // console.log(response);
    if(!response?.success) {

      return throwErr({message: response?.message})
    };
    if(!response?.data?.accessToken){

      return throwErr({message:response?.message})  
    }
    setCookie('accessToken', response?.data?.accessToken, {path:'/', maxAge: 2000})

    throwErr({message: response?.data?.message, changes: response?.data?.changes});
    if(response?.data?.loggedThrough){
      return  await getUserData(response?.data?.accessToken, user?.loggedThrough!);
    }
    return  await getUserData(response?.data?.accessToken, window?.localStorage?.getItem('LOGGED_THROUGH'))



  } catch (error) {
     setServerResponse(error)      
  } finally{
    setLoading(false)
  }
},[])
  return { getUserData,handleChangeFetch,handleDelete,
  }
}

export default useFetch