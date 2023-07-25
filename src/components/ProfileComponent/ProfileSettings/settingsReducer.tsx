import { Reducer } from "react";
import { useUpload } from "../../../hooks";


export enum ACTIONS{
    SET_USERNAME='SET_USERNAME',
    SET_EMAIL='SET_EMAIL',
    SET_PASSWORD='SET_PASSWORD',
    SET_BIO='SET_BIO',
    SET_PICTURE='SET_PICTURE',
    
}


export const initState = {
    userName:'',
    email:'',
    password:'',
    bio:'',
    picture:'',
}
type StateType= {
    userName:string
    email:string
    password:string
    bio:string
    picture:string
}


type ReducerAction={
    type:ACTIONS;
    payload:string 
}



const counterReducer:Reducer<StateType,ReducerAction> = (state:StateType,action:ReducerAction) =>{
    const {type,payload} = action

    switch(type){
        case ACTIONS.SET_USERNAME: 
            return {
                ...state, 
                userName:payload,
            };
        case ACTIONS.SET_PASSWORD:
            return {
                ...state,
                password:payload
            }
        case ACTIONS.SET_BIO: 
        return {
            ...state,
            bio:payload
        };
        case ACTIONS.SET_EMAIL: 
        return {
            ...state,
            email:payload
        };
        case ACTIONS.SET_PICTURE: {
            return {
                ...state,
                picture:payload
            };
        }
        default:
            return state
    }
}

export default counterReducer