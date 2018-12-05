import React, { useState, useEffect, useContext } from 'react'
import { Redirect } from 'react-router-dom'
import context from '../../context'

const DefaultListScreen = () => {
  const [id, setId] = useState(null)
  const { fetch } = useContext(context)

  useEffect(async () => {
    const item = await fetch('assets', 'item').then(res => res.json())
    setId(item._id)
  }, [])

  if (id === null) {
    return null
  } else {
    return <Redirect to={`/item/${id}`} />
  }
}

export default DefaultListScreen
