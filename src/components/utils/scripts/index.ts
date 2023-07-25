type PropsType = {
    id:string
    text:string
    src:string
}
const addScript = ({id,src,text=''}:PropsType)=> new Promise((resolve,reject)=>{
    const element = document.getElementById(id)
    if(element){
        return resolve(true)
    }
    const script = document.createElement('script')
    script.setAttribute('type', 'text/javascript')
    if(src){
        script.setAttribute('src', src)
    }
    script.setAttribute('id', id)
    if(text){
        let inlineScript = document.createTextNode(text)
        script.appendChild(inlineScript)
    }
    script.addEventListener('load', resolve)
    script.addEventListener('error', ()=> reject(new Error(`Error loading ${id}`)))
    script.addEventListener('abort', ()=> reject(new Error(`${id} loading aborted`)))
    document.getElementsByTagName('head')[0].appendChild(script)
})
