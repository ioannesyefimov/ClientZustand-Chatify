import { useContext } from "react";
import { useAuthStore } from "../../ZustandStore";



export default function useServerResponse(){
    const serverResponse =useAuthStore(s =>s.serverResponse)
    const setServerResponse =useAuthStore(s=> s.setServerResponse)

    return {serverResponse,setServerResponse}
}