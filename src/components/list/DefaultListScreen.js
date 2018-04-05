import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

class DefaultListScreen extends Component {
  state = {
    id: null
  }

  async componentDidMount() {
    const item = await this.props.fetch('assets', 'item').then(res => res.json())
    this.setState({ id: item._id })
  }

  render() {
    const { id } = this.state

    if (id === null) {
      return null
    } else {
      return <Redirect to={`/item/${id}`} />
    }
  }
}

export default DefaultListScreen
