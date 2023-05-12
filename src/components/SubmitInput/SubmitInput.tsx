import React, {SetStateAction, useEffect, useState } from "react"
import { sendIco } from "../../assets"
import Button from "../Button/Button"
import {  SubmitInputType } from "../types"
import { HandleClickType } from "../MessagesWrapper/Context/MessagesContext"
interface PropsType extends SubmitInputType {
  placeholder?: string
  name?: string
  handleClick: ({e,value,setValue,propsValue,setPropsValue}: HandleClickType)=>Promise<void>
}
const SubmitInput = ({propsValue,setPropsValue,handleClick, name,placeholder}:PropsType) => {
    const [value,setValue] = useState('')

    let onKeyDown=(e:KeyboardEvent) => {
      if(e.key==='Enter'){
        console.log(`value:`, value);
        console.log(`propsValue:`, propsValue);
        
        handleClick({e,value,setValue,propsValue,setPropsValue})
      }
      
        }
    useEffect(
      ()=>{
        
       window.addEventListener('keydown',onKeyDown);                                                       
          return ()=> window.removeEventListener('keydown', onKeyDown)
      },[value]
    )
  
    return (
      <div className={`inner-wrapper ${name}`}>
        <div className='form-wrapper'>
            <input onChange={(e)=>setValue(e?.target?.value)} value={value} placeholder={placeholder}  name={name} id={name} aria-label={`${name} `} />
        </div>
        <Button type='button' onClick={(e)=>handleClick({e,value,setValue,propsValue,setPropsValue})} img={sendIco} name='submit-btn' text={''} />

    </div>
    
    )
  }
    
    
  
  export default SubmitInput