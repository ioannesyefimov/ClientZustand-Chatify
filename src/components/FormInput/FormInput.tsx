import React, { ChangeEvent, ReactNode, useEffect } from 'react'
import { ActionFunction } from 'react-router-dom'
import './FormInput.scss'

interface FormProps {
    type:string,
    placeholder?:string,
    labelName?:string,
    name:string,
    id:string,
    photo?: string,
    onChange: (e:ChangeEvent<HTMLInputElement|HTMLTextAreaElement> ) => void 
    value:string
    children?:ReactNode
    textArea?: {
      rows:string
      cols:string
    }
}

declare module 'react' {
  interface HTMLAttributes<T> {
      files?: File
  }
}
const FormInput =  React.forwardRef((props: FormProps,ref?: React.Ref<HTMLLabelElement | undefined>) => {
  const {name,labelName,onChange,textArea ,value,placeholder, type,photo,children} = props


  return (
    <div className={`inner-wrapper ${props.name}`}>
      {labelName && (
        <label ref={ref} className='label-color' htmlFor={name}>
          {labelName}
        </label>
        )
      }
      <div className='form-wrapper'>
        {textArea ? (
          <textarea onChange={onChange} value={value} className='field' name={name} rows={textArea.rows ?? 5} cols={textArea.cols ?? 30}  placeholder={placeholder}></textarea>
        ) : (

          <input onChange={onChange} className='field' value={value} placeholder={placeholder} type={type}   name={name} id={name} aria-label={`${name} `} />
        )}
        {photo && (
            <img src={photo} alt="input-icon" />
        ) 
        }
      </div>
        {children ?? null
        }
  </div>
  
  )
})
  
  

export default FormInput