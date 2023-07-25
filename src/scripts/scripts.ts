export type AddScriptType =typeof addScript


export type AddScriptProps ={
    id:string,src:string,text:string | undefined
}
export const addScript = ({id,src,text=''}:AddScriptProps)=> new Promise((resolve,reject)=>{
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
    script.addEventListener('error', ()=> {
        document?.getElementById(id)?.remove()
       return reject(new Error(`Error loading ${id}`))
    })
    script.addEventListener('abort', ()=> {
        document?.getElementById(id)?.remove()

       return reject(new Error(`${id} loading aborted`))
    })
        
    document.getElementsByTagName('head')[0].appendChild(script)
})

// export const addPolicyScript = async () =>{
//     const id1 = `app-policy`
//     const src1 = "//cdn.iubenda.com/cs/gpp/stub.js"
//     return await addScript(id1,src1)
// }
// export const addPolicyScript2 =  async() =>{
//     const id2 = `app-policy2`
//     const src2 = "//cdn.iubenda.com/cs/iubenda_cs.js"
//     return await addScript(id2,src2)
// }
// export const addPolicyScript3 = async () =>{
//     const id3 = `app-policy3`
//     const text2 = ` var _iub = _iub || [];
//     _iub.csConfiguration = {"askConsentAtCookiePolicyUpdate":true,
//     "countryDetection":true,
//     "enableLgpd":true,"enableUspr":true,
//     "floatingPreferencesButtonDisplay":"bottom-right",
//     "gdprAppliesGlobally":false,"lang":"en",
//     "lgpdAppliesGlobally":false,"perPurposeConsent":true,
//     "siteId":3047503,"whitelabel":false,"cookiePolicyId":84763253, 
//     "banner":{ "acceptButtonCaptionColor":"#FFFFFF","acceptButtonColor":"#313E5F",
//     "acceptButtonDisplay":true,"backgroundColor":"#F7FFF9","backgroundOverlay":true,
//     "brandBackgroundColor":"#F7FFF9","brandTextColor":"#313E5F",
//     "closeButtonDisplay":false,"customizeButtonCaptionColor":"#313E5F",
//     "customizeButtonColor":"#DEE6E0","customizeButtonDisplay":true,
//     "explicitWithdrawal":true,
//     "listPurposes":true,"logo":
//     "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAYdSURBVFiF3Zd7UJTXGcZ/395ZdHe5Kg4KEowMUugSLipSL8GxQDrBjDVNgjUJlMnIqDVJcTL10tCaVpKWJqZ4ydQaJyRMtI1picKYmBqJZBCLhptrQIiQNZaLYWVZYC+nfxgQyi6wttM/+s6cOd+c7z3v8zzve853zgf/x2ZQq9WvGgz6DoVCMWww6DvUavVrgOF/AR6gVqvbMjLSLadPV4orV5pERcVJkZGRbtVoNG1AwGSTw3xnhTTI5AonILxtT31+/WRkZtaXmVlZ9qqqT0R8UrJdrdG4EpKSBs6frxJr1qyxKJXK10fApH9H950V0rDw0exFMT/OQ6ZU3pP8E2uW8OfSoxT8fBfylJXcv34DV999C1F12lb0m1/7ZGb+oHtgYCDILQGZQuHM/qxZVlNS7Db44q0FUxI4tvIBrL09aA1+rPuwBplSictu5+3F0cJkapIiI+93CSHkbgkA4snL7d4InrYdiQunvf0a4eERnrBHCYiopzd5Xf8nL7cLrW7GtHxVCsniicV/lIEjceGIU4vBJxTUAaCYcfelox+GusFmRkqvBpAUY+aGKXx0xx02y5QgvaZmGo++Qa+picFbPejC5jN3eRpR67PvOLiGwNoK1la2HTRzoKKLZ9KDKM6bMyGWbORB4aM7HpSaHT8VuHN4mJqXCwmMiWNF0es8fKwC46bn+KbFhOn4OxP8D1Z0kZ+6iIOnutzGGyXgGOw3hjyYJ3PrNU59E4aISL54r4xTOY9S/sTD1P3ht/jOnsPc5avG+ZaUd2PQqvBRyjFoVZSUd0+Id7cEwiWXqXwmBf/Ha0W0VZazcN3jLMhaj+/sOdit/dzuvI65+hzlT2SN899TdpPIQH/qzbeIDDSwp+wmmx4K9EBgGhb12EaiN+Ry7YMT1BQVcrvzOgC68AjC09J55K8fU7ZipIounn/EwM1eG2ADYK2/AXAxJvHeEbCav+Ls9s0ExycS98xWDPctwOVwcOtqMy3vH6fhzUMA7C1rB+cQAH5jkjpss7O39AuQq70n8E3rVc5syyPlxZfR+Pnz+R9L6GmuRzicBH4njtjcfKw3zJzdvpmSjgRmhM6bEGN4UGDpcuG0WTrgL8VeERi+bSH5hUIcgzbO/DQPY/6zJBfsRpLL6Kz6Ox9tyWXxC4Uk/WwXbZXlLNu0bUKMy28cYF7KZtpKC0xAMYwphiFm1aeTEQj+bgJzklP47KWdrD5wlCFLHyefWkflTx5HOJ2sLjlK9Z4dhC5/kH5zJ31tLRNiNP7pziHYU/t+2sjYKIHInP0fAvzw7DWPJGpf3Ut4Wjr95k5Mx0pJ23eYFa+U0PDmIRzWfmYZE/nq/CcEGxPovdI0mZ5RkwA0Ssk6aBfaac0YY3KFnKW/KKKnuRHtrNkM/PNrVDo9w5Y+VDoD0dlPj/N/e2kMCcUmarctHMVWAAzahVa8N99bfKS1bYQkp3D50D6W7HwJc/U5Ih5ay42OL/FbEDWtGHc3pMqAtLZt0n5CAzrOnUHjF4Bypo6u+jpCkpaSVLCbuStWT0/Et70QHxi9Ug8gZdbhExjMyt8doKn0ML6zQ5gZOo8bNdWkvFg0wd9jCZRyySJl1um8JiCTiN9SQM+VRrrrL/HA1u1U5PzILbgnUwDYnUJvfKXhiOQSG+fFKpkZ4P5Msn5tpq3ib4R+bxUfbckhNjcfjX8AVTueZdXvD3FpfzFBsUYCY+KmTWAUqe75mI0ypYoT349CrlK5bbrQMKI35HBpfzGxufn4hoTy6c7nSN1TjHAJeprqSSrYPW1wGH8jEgnFJubHK/E1uMmAS2AfsiFcLoTLhSST0fTWYQIXxRJsTADAYbOh8PF8ojqdSlprGbcG7iwEhaLP4XBMuQYkSSIo4j4WbS4gJHEJSN/yF4IbF6pp3FdE17VWhBBTKler1dahoaEZo7ugvd3zF3DEhBBUVVWxo/BXXG9pGQWSJImwyAX8ctcOli1LQZI8Xnix2+3Y7Xaio2Ng5E6o1Wp7L1yo9U9MTJgyA6mpqZw9XTklWc8iXFy8eBG9Xt/f19d3Z1Aul2dotdoe7uFX7F6aXq+/LZfL0+9ZxX/T/gUNN3vPW7KqQwAAAABJRU5ErkJggg==",
//     "position":"bottom","rejectButtonCaptionColor":"#FFFFFF",
//     "rejectButtonColor":"#313E5F","rejectButtonDisplay":true,
//     "showPurposesToggles":true,"theme":"night_sky-neutral","textColor":"#313E5F" }};
//     `
//     return await addScript(id3,'',text2)
// }


