import React, { ReactNode, useEffect, useState } from 'react'
import { closeIco, hamburgerIco } from '../../assets'
import './Hamburger.scss'
import '../utils/animations.scss';
import { ChildrenType } from '../types'
import { useWindowSize } from '../../hooks'
import { useLocation } from 'react-router-dom'
type PropsType = {
    children?: ReactNode
    type:string
    animation? : {"loaded"?:string, "toggled":string,untoggled:string}
    isHamburger:boolean
    dataLoaded?:'loaded' | 'toggled' | 'untoggledd'
    
}

declare module 'react' {
    interface HTMLAttributes<T> {
        istoggled?: string|boolean
    }
}

const Hamburger = ({children,type,animation,isHamburger=true,dataLoaded}:PropsType) => {
    const [isToggled, setIsToggled] = useState<'loaded'|'toggled'|'untoggled'|''>('loaded')
    const {width} = useWindowSize()
    let isShowed = width < 500 ? 'animate animate--fast animate--forwards' : ''

    let location = useLocation()

    let img = isToggled === 'untoggled' || isToggled==='loaded' ? hamburgerIco : closeIco
    
    let toggle = ()=>{
        console.log(`changing hamburger state`);
        
        if(isToggled === 'loaded'){
            setIsToggled('toggled')
        } else if(isToggled==='toggled') {
            setIsToggled('untoggled')
        } else if (isToggled==='untoggled'){
            setIsToggled('toggled')
        } 
    }
    useEffect(
        ()=>{
            console.log(`isHamburger:`,isHamburger)
            if(isHamburger){
                setIsToggled('untoggled')
            }
        },[isHamburger]
    )
   
    useEffect(
        ()=>{
            if(location.pathname === '/chat' && !location.search ){
                setIsToggled('toggled')
            }else if(location?.search && location?.pathname!=='chat'){
                setIsToggled('untoggled')

            }
        },[location.pathname,location.search]
    )

    useEffect(
        ()=>{
            const onEscape = (e)=>{
                if(e.code==='Escape'){
                    setIsToggled('untoggled')
                }
            }
            window.addEventListener('keydown', onEscape)
            return ()=>{window.removeEventListener('keydown',onEscape)}
        },[]
    )
    // let content = (
    //     <div className={`hamburger bar `} data-istoggled={isToggled}  >
    //         <button onClick={toggle} className='hamburger-btn'>
    //             <img src={hamburgerIco} alt="hamburgerIco" />
    //         </button>
    //         <div data-istoggled={isToggled ?? 'untoggled'} className={`hamburger-children   ${isShowed}`}>
    //         {children}
    //         </div> 
    //     </div>  
    // ) 

    // let bar = (
    //     <div className={`hamburger bar `}  >
    //         <button onClick={toggle} className='hamburger-btn'>
    //             <img src={hamburgerIco} alt="hamburgerIco" />
    //         </button>
    //         <div data-istoggled={isToggled==='loaded' ? 'loaded-bar' : isToggled} className={`hamburger-children  ${isShowed}`}>
    //         {children}
    //         </div> 
    //     </div>  
    // ) 
    let content = (
        <div className={`hamburger-outer ${type} animate animate--normal transition--slow ${isToggled==='toggled' ? animation?.toggled : isToggled==='untoggled' ? animation?.untoggled : ''}`}data-istoggled={isToggled}>
            <button onClick={toggle} className='hamburger-btn'>
            <img src={img} alt="hamburgerIco" />
                </button>
            <div className={`hamburger channel-navigation animate animate--normal transition--slow ${isToggled==='toggled' ? animation?.toggled : isToggled==='untoggled' ? animation?.untoggled : ''}`} data-istoggled={isToggled} >
                <div   className={`hamburger-children animate--normal ${isToggled==='toggled' ? animation?.toggled : isToggled==='untoggled' ? animation?.untoggled : ''}  ${isShowed}`}>
                    {children}
                </div> 
            </div>
            <div onClick={()=>setIsToggled('untoggled')} className='darkening-div'></div>
        </div>
        
    )
    
    return isHamburger ? content : children
    }
export default Hamburger