import { Reducer } from "react";
import { useUpload } from "../../../../hooks";


export enum ACTIONS{
    SET_CHANNEL_NAME='SET_CHANNEL_NAME',
    SET_CHANNEL_DESCRIPTION='SET_CHANNEL_DESCRIPTION',
    SET_CHANNEL_AVATAR='SET_CHANNEL_AVATAR',
    SET_DELETE_CREDENTIALS_CHECKBOX="SET_DELETE_CREDENTIALS_CHECKBOX",
    SET_DELETE_CREDENTIALS_PASSWORD="SET_DELETE_CREDENTIALS_PASSWORD",
    SET_DELETE_CREDENTIALS_EMAIL="SET_DELETE_CREDENTIALS_EMAIL",
    SET_DELETE_CREDENTIALS_CHANNEL_NAME="SET_DELETE_CREDENTIALS_CHANNEL_NAME",
    
}

type StateType= {
    channelName:string
    channelDescription:string
    channelAvatar:string
    verifiedCredentials: {checkBox:boolean,password:string,email:string,channelName:string}
}

export const initState:StateType = {
    channelName:'',
    channelDescription:'',
    channelAvatar:'',
    verifiedCredentials: {checkBox:false,password:'',email:'',channelName:''}
}


type ReducerAction={
    type:ACTIONS;
    payload:string 
}



const channelSettingsReducer:Reducer<StateType,ReducerAction> = (state:StateType,action:ReducerAction) =>{
    const {type,payload} = action

    switch(type){
        case ACTIONS.SET_CHANNEL_NAME: 
            return {
                ...state, 
                channelName:payload,
            };
        case ACTIONS.SET_CHANNEL_DESCRIPTION:
            return {
                ...state,
                channelDescription:payload
            }
        case ACTIONS.SET_CHANNEL_AVATAR: {
            return {
                ...state,
                channelAvatar:payload
            };
        }
        case ACTIONS.SET_DELETE_CREDENTIALS_CHECKBOX: {
            return {
                ...state,
                verifiedCredentials:{...state.verifiedCredentials,checkBox:!state.verifiedCredentials.checkBox }
            };
        }
        case ACTIONS.SET_DELETE_CREDENTIALS_PASSWORD: {
            return {
                ...state,
                verifiedCredentials:{...state.verifiedCredentials,password:payload }
            };
        }
        case ACTIONS.SET_DELETE_CREDENTIALS_CHANNEL_NAME: {
            return {
                ...state,
                verifiedCredentials:{...state.verifiedCredentials,channelName:payload }
            };
        }
        case ACTIONS.SET_DELETE_CREDENTIALS_EMAIL: {
            return {
                ...state,
                verifiedCredentials:{...state.verifiedCredentials,email:payload }
            };
        }
       
        default:
            return state
    }
}

export default channelSettingsReducer