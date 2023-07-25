import React, { useEffect, useState } from 'react'

const useWindowSize = () => {
    const [windowSize, setWindowSize ] = useState(
        {
            width: 0,
            height: 0
        }
    )


    useEffect(
        ()=>{
            const updateWidth = ()=>{
                setWindowSize({width: window.innerWidth,height: window.innerHeight})
            }
            window.addEventListener('resize', updateWidth)
            updateWidth()

            return ()=> window.removeEventListener('resize', updateWidth)
        }, []
    )
  return windowSize
}

export default useWindowSize