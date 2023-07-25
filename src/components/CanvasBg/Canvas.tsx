import { useEffect,useState } from "react"
import './canvas.scss'
type PropsType= {
    src?:string
}
const useProgressiveImage = (src:string) => {  
  const [sourceLoaded, setSourceLoaded] = useState<string>('')

  useEffect(() => {
    const img = new Image()
    img.src = src
    img.onload = () => setSourceLoaded(src)
  }, [src])

  return sourceLoaded 
}
const Canvas = ({src}:PropsType) => {
  return (
    <div 
    className='canvas' id={'canvas'}>
      <img 
          src={useProgressiveImage(src)} alt="" />
    </div>
  )
}

export default Canvas