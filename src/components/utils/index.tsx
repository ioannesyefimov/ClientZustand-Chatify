import React, { ChangeEvent,  RefObject, SetStateAction } from "react";
import { MessageType } from "../types";

 const  validateEmail = function(email:string) {
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; 
       return regex.test(email)
};

//#########################################################

export function getCurrentDay() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

//#########################################################

export function sortMessagesByDate  (data:MessageType[]){
  function sortMessages(a,b){
    return Number(new Date(a.createdAt?.timeStamp)) - Number(new Date(b.createdAt?.timeStamp))
  } 
  
  // Sort array of messages from the end message to the latest
  const sortedData = data.sort(sortMessages);
  
  // let currentDay = createDate().date;
  let currentDay = new Date(sortedData[0].createdAt.timeStamp)
  // console.log(`CURRENT DAY`, currentDay);
  
  
  const stillCurrentDay = (dayOfMessage:Date|string) => {
   if( typeof dayOfMessage !=='object') {
    dayOfMessage = new Date(dayOfMessage)
   }
    let messageYear=dayOfMessage?.getFullYear()
    let messageMonth=dayOfMessage?.getMonth()
    let messageDay=dayOfMessage?.getDay()
    let currentDayYear = currentDay?.getFullYear()
    let currentDayMonth = currentDay?.getMonth()
    let currentDayDay = currentDay?.getDay()
    return messageYear === currentDayYear
      && messageMonth === currentDayMonth &&
      messageDay=== currentDayDay
  }
  
  let dayMessageArray: MessageType[] = [];
  const fullMessageArray:{[index:string]:MessageType[] | any}  = [];
  
  const createMessagesArray = (messages:any) => {

    const newDay:{[index:string]:any} = {};
    newDay[currentDay.toISOString().split('T')[0]] = messages;
    fullMessageArray.push(newDay); 
  }
  
  sortedData.forEach(message => {
    console.log(`message:`,message);
    
    if (!stillCurrentDay(message?.createdAt?.timeStamp)) {
      createMessagesArray(dayMessageArray);
      currentDay = new Date(message.createdAt.timeStamp);
      dayMessageArray = [];
    }
  
    dayMessageArray.push(message);
  });
  
  createMessagesArray(dayMessageArray);
  
  console.log(fullMessageArray);
  // reverse order of messages so that it is from the first message to the latest
  return {fullMessageArray,dayMessageArray}
}
//#########################################################


export const convertQueryString = ({uri,obj}:{[index:string]:any, uri:string})=>{
  return new Promise<string | {success:false,error:any}>((resolve, reject) => {
    if(!uri) return reject({success:false,error:`MISSING URI`}) 
    if(!obj) return reject({success:false,error:`MISSING PARAMS`}) 
    let str = '?' + Object.keys(obj).reduce(function(a:string[], k){
      a.push(k + '=' + encodeURIComponent(obj[k]));
      return a;
    }, []).join('&')
      return resolve(`${uri}${str}`)
  })
}

const throwErr =  (err:any) =>{
 
  if(err?.name ){
    let ERR:{[index:string]: any} = new Error
    ERR.name = err?.name
    ERR.code = err?.code
    ERR.arguments = err?.arguments
    throw ERR

  }
  else {
    throw new Error(err)
  }
}

type FieldsType = {
  [index:string]: string 
}
type ErrorsType = {
  [index:string]: string 
}
type RefsType ={
  [index:string]: RefObject<HTMLInputElement|HTMLLabelElement>
}

const setter = (e:ChangeEvent<HTMLInputElement>, setState:React.Dispatch<React.SetStateAction<any>>) =>{
  setState(e?.currentTarget.value)
}

export const createDate = (date?:string)=>{
  const today = date ? new Date(date) : new Date();
const DATE = {day:"",time:"",timeStamp:today.toISOString(),date:()=>new Date(today)}
const yyyy = today.getFullYear();
let mm:any = today.getMonth() + 1; // Months start at 0!
let dd:any = today.getDate();

if (dd < 10) dd = '0' + dd;
if (mm < 10) mm = '0' + mm;

const formattedToday =  yyyy + '/' + mm + '/' + dd;
  DATE.day = formattedToday
  DATE.time = today.toLocaleTimeString("en-GB")
  return DATE
}
export const validateInput = ({fields,refs}:{fields:FieldsType,refs: RefsType})=>{
  return new Promise<{success:boolean,errors?: ErrorsType}>((resolve, reject) => {
    let errors:ErrorsType = {}
    console.log(refs)
    for(let obj in fields){
      if(fields[obj] === '') {
          refs[obj]?.current?.classList.add('error')
          errors[obj] = Errors.CANNOT_BE_EMPTY
          refs[obj].current?.setAttribute('error',errors[obj])
  
      }
      else if(obj==='email'){
        let isValid = validateEmail(fields[obj]);
        
        if(!isValid) {
          refs[obj]?.current?.classList.add('error')
          errors[obj] = Errors.INVALID_EMAIL
          refs[obj].current?.setAttribute('error',errors[obj])
        }
      } else if (fields[obj].length < 3){
        refs[obj]?.current?.classList.add('error')
        errors[obj] = Errors.SHORT_LENGTH
        refs[obj].current?.setAttribute('error',errors[obj])

      }
    }
    console.log(`ERRORS:` , errors)
    if(Object.keys(errors).length > 0) {
      return reject({success:false,errors})
    }
    for(let ref in refs){
      refs[ref]?.current?.classList.remove('error')
      refs[ref]?.current?.removeAttribute('error')
    }
    return resolve({success:true})
  })
}

interface validateProps {
  firstRef: RefObject<any>
  secondRef: RefObject<any>
  thirdRef: RefObject<any>
}

  
 function validatePassword(password:string, name:string){
    // check whether password doesn't contains at least 
    // 1 uppercase, 1 lowercase, 1 number, and 1 special character. 
    // If it doesn't contains everything mentioned, returns true
    const password_rgx = /^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/

    function kmpSearch(pattern:string, text:string ) {
      
        if (pattern.length == 0)
          return 0; // Immediate match
        // change inputs to lowercase so that comparing will be non-case-sensetive
       pattern = pattern.toLowerCase()
       text = text.toLowerCase()
        // Compute longest suffix-prefix table
        let lsp = [0]; // Base case
        for (let i = 1; i < pattern.length; i++) {
          let j = lsp[i - 1]; // Start by assuming we're extending the previous LSP
          while (j > 0 && pattern[i] !== pattern[j])
            j = lsp[j - 1];
          if (pattern[i] === pattern[j])
            j++;
          lsp.push(j);
        }
      
        // Walk through text string
        let j = 0; // Number of chars matched in pattern
        for (let i = 0; i < text.length; i++) {
          while (j > 0 && text[i] != pattern[j])
            j = lsp[j - 1]; // Fall back in the pattern
          if (text[i]  == pattern[j]) {
            j++; // Next char matched, increment position
            if (j == pattern.length)
              return i - (j - 1);
          }
        }
        return -1; // Not found
      }
    
      const hasNamePatternInPassword = kmpSearch(name, password)

      const isInValidPassword = password_rgx.test(password)
    
    if((hasNamePatternInPassword !== -1) ){
        return Errors.PASSWORD_CONTAINS_NAME
    } else if(isInValidPassword === true) {
        return Errors.INVALID_PASSWORD
    } else {
      return `valid`
    }
}

 
const Errors = {
  SHORT_LENGTH:'SHORT_LENGTH',
  INVALID_CHANNEL_NAME: `Channel name must not contain any special characters such as [*|\":<>[\]{}\`\()';@&$] `,
  CHANNEL_NOT_FOUND: `Such channel wasn't found. Try to type in differently`,
  CHANNELS_NOT_FOUND: `Channels weren't found`,
  USER_NOT_FOUND: `Such user isn't registereg`,
  NOT_A_MEMBER: `You are not a member of this channel. First, join channel`,
  ALREADY_MEMBER:`Such user is already a member`,
  INVALID_PASSWORD: `must be in English and contains at least one uppercase and lowercase character, one number, and one special character`,
  PASSWORD_CONTAINS_NAME: `Password must not contain user's name`,
  USER_EXIST: `USER is already signed up`,
  EMAIL_EXIST: `User was already signed up by this email`,
  NOT_FOUND: 'Not found',
  WRONG_PASSWORD: `WRONG_PASSWORD`,
  INVALID_EMAIL: `Type in valid email`,
  WRONG_EMAIL: `Wrong email`,
  CANNOT_CONTAIN_NUMBERS: `CANNOT CONTAIN NUMBERS`,
  LOGGED_THROUGH_SOCIAL: "LOGGED THROUGH SOCIAL",
  CANNOT_BE_EMPTY: `THIS FIELD CANNOT BE EMPTY`,
  NOT_SIGNED_UP: `NOT SIGNED UP`,
  SIGNED_UP_DIFFERENTLY: `SIGNED UP DIFFERENTLY`,
  ALREADY_EXISTS: `ALREADY EXISTS`,
  INVALID_NUMBER: `INVALID NUMBER`,
  CHANGES_APPLIED: `CHANGES WERE APPLIED`,
  CHANGES_NOT_APPLIED: `CHANGES WERE NOT APPLIED`,
  JWT_MALFORMED: `jwt malformed` ,
  MISSING_ARGUMENTS: `MISSING ARGUMENTS`,
  ABORTED_TRANSACTION: `ABORTED TRANSACTION`,
  NOT_HAVE_PERMISSION: 'USER DO NOT HAVE PERMISSION',
  
}


const timeout = (delay:number)=>{
  return new Promise(res=>setTimeout(res,delay));
}

const convertBase64 = (file:File) => {
  return new Promise<string | ArrayBuffer | null | {err:any}>((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file)
    fileReader.onload = () => {
      resolve(fileReader.result)
    };

    fileReader.onerror=(err)=>{
      reject(err)
    }
  })
}
interface FetchProps {
  url: string
  method?: 'get' | 'post' | 'put' | 'delete' | 'update' | 'PUT' | 'POST' | 'GET' | 'DELETE' | 'UPDATE'
  body?: Object
  headers?: HeadersInit | undefined 
  signal?: AbortSignal
  setError?: React.Dispatch<SetStateAction<any>>
}
 const APIFetch = async({url,
  method='get',
 headers={
  "Content-Type": "application/json",
}, 
body,
signal,
setError,
}:FetchProps) => {
  console.log(`body: `, body);
  console.log(`url: `, url)
 return !method?.toLowerCase().includes('get')   ? (
  await fetch(url, {
    method: method,
    signal,
    headers,
    body: JSON.stringify(body)
  }).then(response=>response.json()).then(data=>{console.log(`data:`,data);return data}).catch(err=>{console.error(err)})
 ) : (
  
  await fetch(url, {
    method: method,
    headers,
    signal,
  }).then(response=>response.json()).then(data=>{console.log(`data:`,data);return data}).catch(err=>{console.error(err)})
 )
}

const isObj = (obj:any) =>{
  return (typeof obj === 'object' && !Array.isArray(obj) && obj !== null && obj.constructor === Object )

}
const isTrue = (arg:any) =>{
  if(Array.isArray(arg) && !arg.length){
    return {arg, is:false}
  }
  if(isObj(arg) && !Object.keys(arg).length){
    return {arg, is: false}
  }
  return {arg, is: !!arg}
}

function countWords(str:string) {
  const arr = str.split(' ');

  return arr.filter(word => word !== '').length;
}

export function DisplayError(error:{[index:string]:any}){
  let IS_OBJECT = isObj(error)
  let display 
  if(IS_OBJECT){
    display = Object.keys(error).map((err,i)=>{
      return (
        <span className="error" key={i}>{JSON.stringify(err)}: {error[err]}</span>
        )
    })
  }else {
    display = <span className="error">{JSON.stringify(error)}</span>
  }

  return (<>{display}</>)
}
export function sleep(ms:number) {
  return new Promise(resolve => {
    let i=0
  let timer = setInterval(()=>{
      i++;
      console.log(`waiting for ${i} seconds...`)
    },1000)
     return setTimeout(()=>{
      clearInterval(timer) 
      return resolve(true)
    }, ms)
  });
}

function getFirstLetter(str:string,words?:number){
  if(!str) return <img src="https://icon2.cleanpng.com/20180719/qlu/kisspng-computer-icons-error-message-download-error-icon-5b504a9606c293.4498774215319886300277.jpg"/>
  let letters
  if(countWords(str) > 1){
    let arr = str.split(' ')
    letters = arr.map(word=>word.charAt(0))
    if(words){
      return letters.slice(0,words).join('')

    }
    return letters.join('')

  } else if(countWords(str) == 1){
    letters = str.charAt(0)
    return letters
  }

}


 
  export {
    countWords,getFirstLetter,
    convertBase64, timeout, Errors, validateEmail,validatePassword, isTrue,isObj,APIFetch,throwErr,setter,
  }