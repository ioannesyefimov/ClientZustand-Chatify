import './App.scss'
import './components/Themes/Themes.scss'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
// import {ProtectedRoute,Landing,ChatContainer,UserComponent, Authentication,NotFound,AuthForm, RedirectComponent, MemberInfo, SearchComponent, ChannelSearch, Profile, ProfileSettings, ServerResponseFallback,ChannelsSettings, ChannelManager, ChannelJoin, ChannelCreate, ChannelCallWrapper} from './components'
import ErrorBoundary from './components/ErrorProvider/ErrorProvider'
import React, { ReactNode, Suspense, lazy } from 'react'
import { LoadingFallback } from './components/LoadingFallback/LoadingFallback'
import ErrorPage from './components/RouteError/RouteError'
const ServerResponseFallback = lazy(()=>import('./components/ServerResponseFallback/ServerResponseFallback'))
const NotFound = lazy(()=>import('./components/NotFound'))
const SearchComponent = lazy(()=>import('./components/SearchComponent/SearchComponent'))
const Landing = lazy(()=>import('./components/Landing/Landing'))
const MemberInfo = lazy(()=>import('./components/UserSearch/UserSearch'))
const ChannelCallWrapper = lazy(()=>import('./components/MultiplePeerComponent/ChannelCallWrapper'))
const ChannelCreate = lazy(()=>import('./components/ChannelManager/ChannelCreate/ChannelCreate'))
const ChannelSearch = lazy(()=>import('./components/ChannelSearch/ChannelSearch'))
const ChannelManager = lazy(()=>import('./components/ChannelManager/ChannelManager'))
const AuthForm = lazy(()=>import('./components/Authentication/AuthForm/AuthForm'))
const ChannelJoin = lazy(()=>import('./components/ChannelManager/ChannelManager'))
const UserComponent = lazy(()=>import('./components/UserComponent/UserComponent'))
const ProtectedRoute = lazy(()=>import('./components/ProtectedRoute/ProtectedRoute'))
const Profile = lazy(()=>import('./components/ProfileComponent/Profile'))
const ProfileSettings = lazy(()=>import('./components/ProfileComponent/ProfileSettings/ProfileSettings'))
const ChatContainer = lazy(()=>import('./components/DashBoard/ChatContainer'))
const ChannelsSettings = lazy(()=>import('./components/DashBoard/ChannelsBar/ChannelsSettings/ChannelsSettings'))
const Authentication = lazy(()=>import('./components/Authentication/Authentication'))
const RedirectComponent = lazy(()=>import('./components/RedirectComponent/RedirectComponent'))
let router = createBrowserRouter([
  {
    element:<ServerResponseFallback/>,
    children:[
      {
        element: <NotFound />,
        path: '*'
      },
   
      {
        element: <Landing />,
        path: '/'
      },
      {
        element:<SearchComponent/>,
        path: '/search',
        children:[
          {
            path:'user/:search?',
            element:<MemberInfo/>
          },
          {
            element: <ChannelSearch/>,
            path: 'channel/:search?'
          },
        ]
    
      },
      {
        element: <UserComponent locationType='user' />,
        path: '/user/:userId'
      },
      {
        element: <ProtectedRoute />,
        path:'',
        children: [
          {
            element:<Profile/>,
            path:'/profile'
          },
          
          {
            element: <ProfileSettings/>,
            path:'/profile/settings'
          },
          {
    
            element: <ChatContainer  />,
            path: '/chat-video/:channel_id',
            children: [
             {
               element: <ChannelsSettings/>,
               path:'settings'
             },
            
            ]
           },
          
          {
    
           element: <ChatContainer  />,
           path: '/chat/:channel_id?/:manager?',
           children: [
            {
              element: <ChannelsSettings/>,
              path:'settings'
            },
           
           ]
          },
          // {
          //   element: <ChannelCallWrapper/>,
          //   path:'/chat-video/:channel_id?'
          // },
          {
           // element: <ChannelManager/>,
           // path: '/chat/manage',
           // children: [
              //{
             //   path:'create',
           //     element: <ChannelCreate/>
              // },
              // {
                // path:'join/:search?',
                // element: <ChannelJoin/>
              // }
            // ]
       
           },
        ]
      },
      {
        element: <Authentication />,
        path: '/auth/',
        children: [
          {
            element: <RedirectComponent />,
            path: 'redirect/:params?'
          },
          {
            element: <AuthForm redirectType='auth/user' type="register" />,
            path:'register/:search?'
          },
          {
            element: <AuthForm redirectType='auth/user' type="signin" />,
            path:'signin/:search?'
    
          }
        ],
      },

    ]
  },
  {
    errorElement:<ErrorPage/>
  }  
 
])
function App() {
  
  
  return (
    <div className="App">
      <Suspense fallback={<LoadingFallback/>}>
        <RouterProvider  router={router} />

      </Suspense>
    </div>
  )
}

export default App
