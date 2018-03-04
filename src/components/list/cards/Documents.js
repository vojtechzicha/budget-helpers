import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import Card from './Card'

class DocumentsCard extends Component {
  render() {
    const { auth } = this.props

    return !auth.isOneDriveAuthenticated() ? (
      <Card title="Documents" subtitle="OneDrive signed out">
        <Link to="/onedrive/signin">Sign in</Link>
      </Card>
    ) : (
      <Card title="Documents" />
    )
  }
}

const Documents = item => ({
  key: 'documents',
  rows: item.documents === undefined ? 1 : item.documents.length,
  card: (fetch, onUpdate, auth) => <DocumentsCard item={item} fetch={fetch} onUpdate={onUpdate} auth={auth} />
})

export default Documents
