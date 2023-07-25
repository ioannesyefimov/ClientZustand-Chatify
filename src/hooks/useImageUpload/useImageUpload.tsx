import React, { useEffect, useState } from 'react'
import { convertBase64 } from '../../components/utils'


const useImageUpload = (file:File | undefined) => {
    const [convertedFile,setConvertedFile] = useState<string>('')

    useEffect(
        ()=>{
            if(!file) return console.log(`FILE IS EMPTY`)
            let convertFile = async (file:File)=>{
                let FILE= await convertBase64(file)
                if(!FILE) return console.log(FILE)
                if(typeof FILE === 'string') setConvertedFile(FILE)
            }
            convertFile(file)
            console.log(`CONVERTED FILE:`, convertedFile)
        },[file]
    )
    return convertedFile
}

export default useImageUpload