import { io } from "socket.io-client";
const SocketStore = ()=>{
    const certOptions = {
        pfx:('../../../ssl/cert.pfx'),
        passphrase:'134679582ioa',
    }

const serverUrl = import.meta.env.VITE_IP_ADDRESS ?  `https://${import.meta.env.VITE_IP_ADDRESS}:5050` : 'https://localhost:5050'


    return {io,certOptions,serverUrl}
}
export default SocketStore


