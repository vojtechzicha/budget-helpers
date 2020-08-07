import React, { Fragment, useState } from 'react'
import { Formik } from 'formik'
import * as Yup from 'yup'
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
    }}>
    {({ isSubmitting, handleSubmit, values, errors, touched, handleChange, handleBlur }) => (
      <form onSubmit={handleSubmit}>
        <div className='form-row'>
          <div className='col'>
            <input
              type='text'
              className='form-control'
              placeholder='value'
              name='value'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.value}
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
  </Formik>
)

const SerialKeyCard = ({ item, fetch, onUpdate }) => {
  const [editing, setEditing] = useState(false)
  const [hovering, setHovering] = useState(false)

  const handleRemove = async () => {
    await fetch(
      'assets',
      `item/${item._id}`,
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

  const handleEdit = async newSerialKey => {
    await fetch(
      'assets',
      `item/${item._id}`,
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

    setEditing(false)
    onUpdate()
  }

  return (
    <Card title='Serial Key'>
      {editing ? (
        <EditingRow val={item.serialKey} onSubmit={handleEdit} onCancel={() => setEditing(false)} />
      ) : (
        <h6 className='card-subtitle mb-2 text-muted' onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
          {item.serialKey === '' ? <em>missing</em> : item.serialKey}{' '}
          {hovering ? (
            <Fragment>
              <button type='button' className='btn btn-default btn-outline btn-small' onClick={() => setEditing(true)}>
                <Octicon name='pencil' />
              </button>
              <button type='button' className='btn btn-default btn-outline btn-small' onClick={handleRemove}>
                <Octicon name='trashcan' />
              </button>
            </Fragment>
          ) : null}
        </h6>
      )}
    </Card>
  )
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
  card: (fetch, onUpdate) => <SerialKeyCard item={item} onUpdate={onUpdate} fetch={fetch} />
})

export default SerialKey
