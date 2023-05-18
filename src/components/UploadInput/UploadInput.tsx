import { ChannelType } from "../types"
import './UploadInput.scss'
import React from "react"
import { Button } from ".."
import { trashIco, uploadIco } from "../../assets"
type PropsType ={
    channel?: Partial<ChannelType>
    labelName?:string
    id:string
    img?:string
    handleRemoveImg: () => void
    onChange: (e:React.ChangeEvent<HTMLInputElement>)=>void
    value?:  string
}

const UploadInput = React.forwardRef(({channel,labelName,id,onChange,handleRemoveImg, value}: PropsType,ref?: React.Ref<HTMLLabelElement>) => {

    return(

        <label ref={ref} htmlFor={id} className="file-upload-component inner-wrapper">
            {labelName ?? ''}
            <div className="wrapper">

                <img className={!value ? 'default' :`converted-img`}  src={!value ? uploadIco : value }  />
                <input  type="file" name={'upload'} id={id} onChange={onChange}  />
                <Button img={trashIco} name='delete-btn' onClick={handleRemoveImg}/>
            </div>

        </label>
    )
   
    
}
)

// const UploadInput = ({channel,labelName,id,setter}:PropsType) => {
//     const {setError} = useError()
//     const [convertedImage,setConvertedImage] = useState<string>()
 
//     const handleFileChange = async(e:ChangeEvent<HTMLInputElement>) =>{
//         if(e.target.files){
//             setter(e.target.files[0])
//             let convertedImg = await convertBase64(e.target.files[0])
//             if(typeof convertedImg ==="string"){
//                 setConvertedImage(convertedImg)
//                 return
//             }
//             console.log(`NOT STRING: `, convertedImg)
//         }
//         console.log(e.target.files)
//     }

// //    const submitPhoto = async (e:FormEvent<HTMLButtonElement>) => {
// //     e.preventDefault()
// //     if(!selectedFile) return console.log(`NOT SELECTED FILE`)
// //     // const file = event.target.files[0]
// //     const base64 = await convertBase64(selectedFile)

// //         // 👇 Uploading the file using the fetch API to the server
// //      const response = await APIFetch({url:`http://localhost:5050/api/upload`,method:'POST', body: {image: base64}}) 


// //       if(!response.success){
// //           setError(response?.message)
// //           return
// //       }
// //         console.log(response?.data)
// //         const response2 = await APIFetch({url:`${url}`,method:'PUT',body:{email:user?.email,channelName: channel?.name} })
       

// //         if(!response2.success){
// //             setError(response2?.message)
// //             return
// //         }
// //         console.log(`UPLOADED PICTURE`)
        
// //       };
      
    

//   return (
//         <label htmlFor={id} className="file-upload-component">
//             {labelName ?? ''}
//             <img className="converted-img"  src={convertedImage ?? uploadIco}  />
//             <input type="file" name={'upload'} id={id} onChange={handleFileChange}  />
//         </label>
   
//     )
// }

export default UploadInput