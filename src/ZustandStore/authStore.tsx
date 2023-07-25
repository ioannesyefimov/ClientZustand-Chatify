import {create} from 'zustand'
import { UserType } from '../components/types'

type onlineUsers= {[index:string]:string}
const initState = {
    user:{userName: '', email: '', picture: '', _id: '', loggedThrough: '',channels:[] },
    onlineUsers:[],
    loading:false,
    serverResponse:null,
    serverUrl:import.meta.env.VITE_IP_ADDRESS ?  `https://${import.meta.env.VITE_IP_ADDRESS}:5050/api` : 'https://localhost:5050/api',
}

const useAuthStore = create<{
    user:UserType;
    onlineUsers: onlineUsers;
    serverResponse:any;
    serverUrl:string
    loading:boolean
    setOnlineUsers:(onlineUsers:onlineUsers)=>void
    setServerResponse:(serverResponse:any)=>void;
    setUser: (user:UserType)=>any;
    setLoading:(state:boolean)=>void;
    resetAuth:()=>void
}>((set)=> ({
    user: initState.user,
    onlineUsers:[],
    loading: false,
    setOnlineUsers: (onlineUsers:onlineUsers)=>set({onlineUsers}),
    serverResponse:null,
    setServerResponse:(serverResponse:any)=>set({serverResponse}),
    setUser: (user:UserType) =>set({user}),
    setLoading: (state:boolean) => set({loading: state}),
    serverUrl:initState?.serverUrl,
    resetAuth: ()=>{set(initState)}
}))


export default useAuthStore