import { useEffect, useRef } from "react"
import { disabledIco } from "../../assets"

export type SocialBtnProps = {
    authType:string
    id:string
    execFunc:(authType:string)=>any
    icon:string
    socialType:string
}
const SocialBtn =  ({authType,id,execFunc,icon,socialType}:SocialBtnProps) => {
  let googleBtn = (
    <div className="social-btn-outer"  >
      <img src={icon} alt={`${socialType} icon`} />
      <button type="button" className="social-btn"  id={id}></button> 
     </div>
  )

  let socialBtn = (
    <div className="social-btn-outer"  >
      <img src={icon} alt={`${socialType} icon`} />
      <button  onClick={(e)=> {e.preventDefault(); ;execFunc(authType)}} type="button"  className="social-btn" id={id}></button>
    </div>
  )
    return socialType === 'Google' ? googleBtn : socialBtn
  }
  
  export default SocialBtn