import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import Octicon from 'react-octicon'
import { Formik } from 'formik'
import * as Yup from 'yup'

import Card from './Card'
import context from '../../../context'

const EditingRow = ({ doc, onSubmit, onCancel }) => (
  <Formik
    initialValues={{ key: doc.key }}
    validationSchema={Yup.object().shape({
      key: Yup.string().required('key must be provided')
    })}
    onSubmit={async (values, { setSubmitting }) => {
      await onSubmit(doc.id, values.key)
      setSubmitting(false)
    }}
    render={({ isSubmitting, handleSubmit, values, errors, touched, handleChange, handleBlur }) => (
      <form onSubmit={handleSubmit}>
        <div className='form-row'>
          <div className='col'>
            <input
              type='text'
              className='form-control'
              placeholder='vey'
              name='key'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.key}
            />
          </div>
          <div className='col'>
            <button type='submit' className='btn btn-primary btn-small' disabled={isSubmitting}>
              <Octicon name='check' />
            </button>
            <button type='button' className='btn btn-default btn-small' onClick={onCancel}>
              <Octicon name='x' />
            </button>
          </div>
        </div>
      </form>
    )}
  />
)

class DocumentsCard extends Component {
  state = {
    adding: false,
    hover: -2,
    editing: -2,
    links: {}
  }

  uploadInput = null

  handleUpload = async e => {
    const {
      item: { _id },
      onUpdate
    } = this.props
    const { fetch, auth } = this.context

    e.preventDefault()

    const data = new FormData()
    data.append('file', this.uploadInput.files[0])

    await fetch(
      'assets',
      `item/${_id}/document`,
      {
        method: 'PUT',
        body: data
      },
      {
        'X-OneDrive-Token': auth.getOneDriveToken()
      }
    )

    this.uploadInput.value = null
    this.setState({ adding: false })
    onUpdate()
  }

  handleRemove = async docId => {
    const {
      item: { _id, documents },
      onUpdate
    } = this.props
    const { fetch } = this.context

    const newDocuments = [...documents.filter(doc => doc.id !== docId)]

    await fetch(
      'assets',
      `item/${_id}`,
      {
        method: 'post',
        body: JSON.stringify({
          documents: newDocuments
        })
      },
      {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    )

    onUpdate()
  }

  handleEdit = async (docId, newKey) => {
    const {
      item: { _id, documents },
      onUpdate
    } = this.props
    const { fetch } = this.context

    const oldDocument = documents.find(doc => doc.id === docId)
    const newDocuments = [...documents.filter(doc => doc.id !== docId), { ...oldDocument, key: newKey }]

    await fetch(
      'assets',
      `item/${_id}`,
      {
        method: 'post',
        body: JSON.stringify({
          documents: newDocuments
        })
      },
      {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    )

    this.setState({ editing: -2 })
    onUpdate()
  }

  handleLoadDocLink = async docId => {
    const {
      item: { _id }
    } = this.props
    const { fetch, auth } = this.context

    if (this.state.links[docId] !== undefined) return

    const res = await fetch(
      'assets',
      `item/${_id}/document/${docId}`,
      {},
      {
        'X-OneDrive-Token': auth.getOneDriveToken()
      }
    ).then(res => res.json())

    this.setState(({ links }) => ({ links: { ...links, [docId]: res.link } }))
  }

  render() {
    const {
      item: { documents }
    } = this.props
    const { adding, hover, editing, links } = this.state
    const { auth } = this.context

    return !auth.isOneDriveAuthenticated() ? (
      <Card title='Documents' subtitle='OneDrive signed out'>
        <Link to='/onedrive/signin'>Sign in</Link>
      </Card>
    ) : (
      <Card
        title={
          <span>
            Documents{' '}
            <button
              type='button'
              className='btn btn-default btn-outline btn-small'
              onClick={() => this.setState(({ adding }) => ({ adding: !adding }))}>
              <Octicon name='plus' />
            </button>
          </span>
        }>
        {adding ? (
          <form onSubmit={e => e.preventDefault()}>
            <div className='form-row'>
              <div className='col'>
                <input
                  ref={ref => {
                    this.uploadInput = ref
                  }}
                  type='file'
                  className='form-control'
                  onChange={this.handleUpload}
                  onClick={e => (e.target.value = null)}
                />
              </div>
            </div>
          </form>
        ) : (
          <div className='card-text'>
            {(documents || []).map(doc => (
              <div key={doc.id} onMouseEnter={() => this.setState({ hover: doc.id })} onMouseLeave={() => this.setState({ hover: -2 })}>
                {editing === doc.id ? (
                  <EditingRow doc={doc} onSubmit={this.handleEdit} onCancel={() => this.setState({ editingIndex: -2 })} />
                ) : (
                  <Fragment>
                    <a
                      href={links[doc.id] !== undefined ? links[doc.id] : '/'}
                      target='_blank'
                      rel='noopener noreferrer'
                      title={doc.filename}
                      onClick={e => {
                        if (links[doc.id] === undefined) {
                          this.handleLoadDocLink(doc.id)
                          e.preventDefault()
                          e.stopPropagation()
                        }
                      }}
                      onMouseEnter={() => this.handleLoadDocLink(doc.id)}>
                      {doc.key} [{doc.filename.substr(doc.filename.lastIndexOf('.') + 1, doc.filename.length - 4).toUpperCase()}]
                    </a>
                    {hover === doc.id && (
                      <Fragment>
                        <button
                          type='button'
                          className='btn btn-default btn-outline btn-small'
                          onClick={() => this.setState({ editing: doc.id })}>
                          <Octicon name='pencil' />
                        </button>
                        <button type='button' className='btn btn-default btn-outline btn-small' onClick={() => this.handleRemove(doc.id)}>
                          <Octicon name='trashcan' />
                        </button>
                      </Fragment>
                    )}
                    <br />
                  </Fragment>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    )
  }
}

DocumentsCard.contextType = context

const Documents = item => ({
  key: 'documents',
  rows: item.documents === undefined || item.documents === null || item.documents.length < 1 ? 1 : item.documents.length,
  card: (fetch, onUpdate, auth) => <DocumentsCard item={item} onUpdate={onUpdate} />
})

export default Documents
