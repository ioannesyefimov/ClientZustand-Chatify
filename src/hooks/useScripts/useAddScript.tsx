

import React, { useEffect, useState } from 'react'
import { AddScriptType,addScript } from '../../scripts/scripts'
import { sleep } from '../../components/utils'

const useAddScript = ({...params}:PropsType) => {
    const [error,setError]=useState(false)
    let appendScript = async({...params}:PropsType)=>{
      try {
          console.log(`ADDING SCRIPT`)
          await addScript(params)
      } catch (err) {
        console.error(err)
        if(error.error == err.error) {
          return console.error('FAILED TO LOAD TWICE')
        }
        setError(err)
      }
    }
    useEffect(
        ()=>{
          appendScript(params)
        },[]
    
      )
        useEffect(
          ()=>{
            if(error){
              sleep(15000).then(()=>appendScript(params))
            }
          },[error]
        )
}

export default useAddScript