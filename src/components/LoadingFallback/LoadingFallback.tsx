import React from 'react'
import { loadingGif } from '../../assets'
import './loadingFallback.scss'

export const LoadingFallback = ({children,className}:{className?:string,children?:React.ReactNode})=> {

    return (
        <div className={className ?? 'loading-component'} >
        <img  className="box-shadow" src={loadingGif} alt="loading" />
        {children ?? null}
    </div>
    )
}