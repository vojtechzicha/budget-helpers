import React, { useState, useEffect } from 'react'
import { Redirect } from 'react-router-dom'

const DefaultListScreen = ({ fetch }) => {
  const [id, setId] = useState(null)

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
