import React, { Component, Fragment } from 'react'
import { Formik } from 'formik'
import Yup from 'yup'
import Octicon from 'react-octicon'

import Card from './Card'

const EditingRow = ({ val, onSubmit, onCancel }) => (
  <Formik
    initialValues={{ value: val }}
    validationSchema={Yup.object().shape({
      value: Yup.string().required('value must be provided')
    })}
    onSubmit={async (values, { setSubmitting }) => {
      await onSubmit(values.value)
      setSubmitting(false)
    }}
    render={({ isSubmitting, handleSubmit, values, errors, touched, handleChange, handleBlur }) => (
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="value"
              name="value"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.value}
            />
          </div>
          <div className="col">
            <button type="submit" className="btn btn-primary btn-small" disabled={isSubmitting}>
              <Octicon name="check" />
            </button>
            <button type="button" className="btn btn-default btn-small" onClick={onCancel}>
              <Octicon name="x" />
            </button>
          </div>
        </div>
      </form>
    )}
  />
)

class SerialKeyCard extends Component {
  state = {
    editing: false,
    hovering: false
  }

  handleRemove = async () => {
    const { item: { _id }, fetch, onUpdate } = this.props

    await fetch(
      'assets',
      `item/${_id}`,
      {
        method: 'post',
        body: JSON.stringify({
          serialKey: null
        })
      },
      {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    )

    onUpdate()
  }

  handleEdit = async newSerialKey => {
    const { item: { _id }, fetch, onUpdate } = this.props

    await fetch(
      'assets',
      `item/${_id}`,
      {
        method: 'post',
        body: JSON.stringify({
          serialKey: newSerialKey
        })
      },
      {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    )

    this.setState({ editing: false })
    onUpdate()
  }

  render() {
    const { item: { serialKey } } = this.props
    const { editing, hovering } = this.state

    return (
      <Card title="Serial Key">
        {editing ? (
          <EditingRow val={serialKey} onSubmit={this.handleEdit} onCancel={() => this.setState({ editing: false })} />
        ) : (
          <h6
            className="card-subtitle mb-2 text-muted"
            onMouseEnter={() => this.setState({ hovering: true })}
            onMouseLeave={() => this.setState({ hovering: false })}>
            {serialKey === '' ? <em>missing</em> : serialKey}{' '}
            {hovering ? (
              <Fragment>
                <button type="button" className="btn btn-default btn-outline btn-small" onClick={() => this.setState({ editing: true })}>
                  <Octicon name="pencil" />
                </button>
                <button type="button" className="btn btn-default btn-outline btn-small" onClick={() => this.handleRemove()}>
                  <Octicon name="trashcan" />
                </button>
              </Fragment>
            ) : null}
          </h6>
        )}
      </Card>
    )
  }
}

const SerialKey = item => ({
  key: 'serial-key',
  rows: item.serialKey !== undefined && item.serialKey !== null ? 1 : 0,
  new: {
    label: 'Serial Key',
    key: 'serial-k',
    handleNew: async (item, fetch) => {
      const { _id } = item

      await fetch(
        'assets',
        `item/${_id}`,
        {
          method: 'post',
          body: JSON.stringify({
            serialKey: ''
          })
        },
        {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      )
    }
  },
  card: (fetch, onUpdate) => <SerialKeyCard item={item} fetch={fetch} onUpdate={onUpdate} />
})

export default SerialKey
