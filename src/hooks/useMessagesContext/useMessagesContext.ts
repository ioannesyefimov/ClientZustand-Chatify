import React, { useContext } from 'react'
import { MessagesContext } from '../../components/MessagesWrapper/Context/MessagesContext'

export default function useMessagesContext() {
    const value = useContext(MessagesContext)
  return value
}
