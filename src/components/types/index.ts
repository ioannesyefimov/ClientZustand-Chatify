import { Dispatch, ReactElement, SetStateAction } from "react"
export type SubmitInputType ={
    e:React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement> | undefined
    value:any
    setValue:Dispatch<SetStateAction<any>>
    propsValue:any
    setPropsValue:Dispatch<SetStateAction<any>>
}

export type RoleType ={
    _id:string
    permissions:{_id:string,description:string,name:string},
    name:string
}

export type MemberType = {
    _id:string
    member:UserType
    roles: RoleType[]
}

export type MessageType =  {
    user: UserType
    createdAt: {day:string,time:string,timeStamp:string,Date: 'string', date?:()=>Date} 
    message: string
    channelAt: ChangesType[]
    _id?: string

}

export type ResponseType = {
    name?:string
    arguments?:any
    message?:string
    success?:boolean
    data?:any
    err?:any
}
export type SocketResponse = {
    [index:string]:any
    success:boolean
    data?: any
    message?: any
    err?:any
    
  }
export type Member = UserType

export type ChannelType = {
    [index:number]: ChannelType
    _id?:string 
    channel?:ChannelType
    channelName:string
    messages: MessageType[] 
    members: Member[]
    isJoined?:boolean
    channelAvatar:string 
    channelDescription?: string
    hasAdminPermissions?:boolean
}


export type ProviderProps = {
    children: React.ReactNode
}



export type ChildrenType = {
    children?: ReactElement 
}

export type LogType  = {
    userName: string | undefined 
    accessToken: string
    email: string
    password?: string
}

export type UserType = {
    member?:UserType
    roles?:RoleType[]
    userName:string
    email:string
    picture?:string
    phone?:string
    _id?:string
    loggedThrough?: string
    channels:ChannelType[]
    bio?: string
}
export type ChangesType =  {
    picture: unknown
    userName?:string
    email?:string
    photo?:string
    id?:string
    loggedThrough?: string
    bio?: string
}
export type LoginType  = {
    userName:string 
    email:string
    id?:string
    loggedThrough?: string
    password?: string
}

export type HandleFetchProps = {
    data?: FormData,
    user: UserType | any,
    accessToken: string
    deletedThrough: string
  
  }