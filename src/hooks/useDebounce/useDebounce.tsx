import React, { useEffect, useState } from 'react'

type PropsType = {
    value:any
    delay: number
}

function useDebounce({value,delay}:PropsType) {
    const [debouncedValue,setDebouncedValue]=useState(value)

    useEffect(
        ()=>{
            const id = setTimeout(()=>{
                console.log(`setting debounce timeout`);
                
                return setDebouncedValue(value)
            },delay)
                

            return ()=>{
                console.log(`setting debounce timeout`);
                clearTimeout(id);
            }
        },[delay,value]
    )
  return debouncedValue
}

export default useDebounce