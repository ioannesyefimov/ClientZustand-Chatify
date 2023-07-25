import React from 'react'
import './Dashboard.scss'
import ChatContainer from './ChatContainer'
const Dashboard: React.FC = ()  => {
  
  return (
    <div className='dashboard-component'>
      <ChatContainer />
    </div>
  )
}

export default Dashboard