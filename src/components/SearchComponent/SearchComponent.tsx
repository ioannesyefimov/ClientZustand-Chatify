import { Link, Outlet, useLocation } from 'react-router-dom'
import './SearchComponent.scss'
import NavigationBar from '../NavigationBar/NavigationBar'


const SearchComponent = () => {
    const location = useLocation()
    let content = (
        <div className='search-component flex'>
            <Link to='user' replace>Search User</Link>
            <Link to='channel' replace>Search Channel</Link>
        </div>
    )
   return <><NavigationBar/> {location.pathname === '/search' ? content  : <Outlet/>}</> 
}

export default SearchComponent