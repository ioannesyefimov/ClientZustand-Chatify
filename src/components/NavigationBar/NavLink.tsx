import React from 'react'
import { useNavigate } from 'react-router-dom'
type PropsType = {
    text:string
    href:string
    img:string
}

const NavLink = ({text,href,img}:PropsType) => {
  const navigate = useNavigate()
    return (
        <>
            <li className='nav-link' onClick={()=>navigate(href)} >
        <span>{text}</span>
        {img ? (
            <img className='nav-img' src={img} alt="nav link photo"  />
            ): null}
       </li>
        </>

  )
}

export default NavLink