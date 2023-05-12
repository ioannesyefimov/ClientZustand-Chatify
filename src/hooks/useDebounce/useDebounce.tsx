import React, { useEffect, useState } from 'react'

type PropsType = {
    value:any
    delay: number
}

function useDebounce({value,delay}:PropsType) {
    const [debouncedValue,setDebouncedValue]=useState(value)

    useEffect(
        ()=>{
            const id = setTimeout(()=>setDebouncedValue(value),delay)

            return ()=>clearTimeout(id)
        },[delay,value]
    )
  return debouncedValue
}

export default useDebounce