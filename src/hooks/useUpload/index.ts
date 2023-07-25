import React, { useEffect, useState } from 'react'
import { Dispatch } from "react"
import { convertBase64 } from "../../components/utils"

const index = () => {
    const [file,setFile] =useState('')
    const handleUpload = async(e?:React.ChangeEvent<HTMLInputElement> ) =>{
        if(!e?.currentTarget){
            return setFile('')
        } 
        let file = e?.currentTarget.files![0]
        console.log(`FILES:`, file);
        console.log(`e:`, e);
        
        if(!file) return setFile('')
        let converted = await convertBase64(file)
        if(!converted) return console.error(`ERROR:` , converted)
        if(typeof converted === 'string'){
            setFile(converted)
        }
        return converted
    }
        return {file, handleUpload}
}


export default index