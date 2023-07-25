import React, { ReactNode, useEffect } from 'react'
type ButtonProps= {
    text?: string
    name: string
    img?: string
    isToggled?:boolean
    type?: "button" | "submit" | "reset" 
    onClick?: (e:React.MouseEvent<HTMLButtonElement>) => void
    onHover?:(e:React.MouseEvent<HTMLButtonElement>) => void
    children?:ReactNode
}
const Button = ({text,onClick,name,img,isToggled,type='button',children,onHover}:ButtonProps) => {
  let btnRef = React.createRef<HTMLButtonElement>()

  
  return (
    <button onMouseOver={onHover} ref={btnRef}  className={name} type={type} onClick={onClick}>
      {text?   text : null }
      {img ? <img data-istoggled={isToggled} src={img} alt={`${name} image`}/> : null}
      {children ?? null}
      </button>
  )
}

export default Button