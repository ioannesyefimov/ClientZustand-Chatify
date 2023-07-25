import useAuthStore from "./authStore";
import useChatStore from "./chatStore";
import { mountStoreDevtool } from 'simple-zustand-devtools';
if(import.meta.env.MODE === 'development'){
    mountStoreDevtool('AuthStore',useAuthStore)
    mountStoreDevtool('ChatStore',useChatStore)
}


export {
    useAuthStore,useChatStore
}