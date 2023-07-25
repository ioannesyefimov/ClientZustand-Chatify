import React from "react"
import { useNavigate } from "react-router-dom"
import { notFoundIco } from "../assets"

const NotFound: React.FC = () =>{
    const navigate = useNavigate()
    return (
      <div className='notFound'>
        <img src={notFoundIco} alt="not found img" />
        <button onClick={() => navigate('/chat')}>Back to main</button>
      </div>
    )
  }

  export default NotFound