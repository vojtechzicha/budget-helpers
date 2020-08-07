import React, { Fragment, Component } from 'react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import Octicon from 'react-octicon'
import moment from 'moment'

import Card from './Card'

const StaticRow = ({ val }) => (
  <Fragment>
    <p className='card-text' key={val.id}>
      <strong>
        <u>{val.type}</u>
      </strong>
      <br />
      {val.name}
      <br />
      <strong>Value</strong>:{' '}
      <span title={val.originalCurrencyAmount.toLocaleString('cs-CZ', { style: 'currency', currency: val.originalCurrency })}>
        {val.accountingCurrencyAmount.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK' })}
      </span>
      <br />
      <strong>Since</strong>: {moment(val.invoiceDate).format('MMMM Do, YYYY')}
    </p>
  </Fragment>
)

const EditingRow = ({ val, onSubmit, onCancel }) => (
  <Formik
    initialValues={{
      type: val.type,
      name: val.name,
      amount: val.accountingCurrencyAmount,
      invoiceDate: moment(val.invoiceDate).format('YYYY-MM-DD')
    }}
    validationSchema={Yup.object().shape({
      type: Yup.string().required('type must be provided'),
      name: Yup.string().required('name must be provided'),
      amount: Yup.number().required('amount must be provided'),
      invoiceDate: Yup.date().required('invoiceDate must be provided')
    })}
    onSubmit={async (values, { setSubmitting }) => {
      await onSubmit(val.id, {
        type: values.type,
        name: values.name,
        invoiceDate: moment(values.invoiceDate, 'YYYY-MM-DD').toISOString(),
        accountingCurrencyAmount: values.amount,
        originalCurrencyAmount: values.amount,
        originalCurrency: 'CZK'
      })
      setSubmitting(false)
    }}>
    {({ isSubmitting, handleSubmit, values, errors, touched, handleChange, handleBlur }) => (
      <form onSubmit={handleSubmit}>
        <div className='form-row'>
          <div className='col'>
            <input
              type='text'
              className='form-control'
              placeholder='Type'
              name='type'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.type}
              style={{ fontWeight: 'bold' }}
            />
          </div>
          <div className='col'>
            <input
              type='text'
              className='form-control'
              placeholder='Name'
              name='name'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.name}
            />
          </div>
        </div>
        <div className='form-row'>
          <div className='col'>
            <input
              type='date'
              className='form-control'
              placeholder='invoiceDate'
              name='invoiceDate'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.invoiceDate}
            />
          </div>
        </div>
        <div className='form-row'>
          <div className='col'>
            <input
              type='number'
              className='form-control'
              placeholder='amount'
              name='amount'
              min='0'
              step='0.01'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.amount}
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

class KeyAmountCard extends Component {
  state = {
    editingIndex: -2,
    hover: false,
    item: this.props.item
  }

  handleEdit = async (id, val) => {
    const { item } = this.state
    const { itemKey, handleEdit } = this.props

    const newVal = await handleEdit(item, id, val)

    this.setState({
      item: { ...item, [itemKey]: newVal },
      editingIndex: -2
    })
  }

  handleCreate = async () => {
    const { item } = this.state
    const { itemKey, handleCreate } = this.props

    const newVal = await handleCreate(item)

    this.setState({
      item: { ...item, [itemKey]: newVal },
      editingIndex: newVal.length - 1
    })
  }

  handleRemove = async id => {
    const { item } = this.state
    const { itemKey, handleRemove } = this.props

    const newVal = await handleRemove(item, id)

    this.setState({
      item: { ...item, [itemKey]: newVal }
    })
  }

  render() {
    const { editingIndex, hover, item } = this.state
    const { itemKey, label } = this.props

    return (
      <Card
        title={
          <span onMouseEnter={() => this.setState({ hover: -1 })} onMouseLeave={() => this.setState({ hover: -2 })}>
            {label}{' '}
            {hover === -1 && (
              <button type='button' className='btn btn-default btn-outline btn-small' onClick={this.handleCreate}>
                <Octicon name='plus' />
              </button>
            )}
          </span>
        }>
        <div className='card-text'>
          {item[itemKey].map(val => (
            <div key={val.id} onMouseEnter={() => this.setState({ hover: val.id })} onMouseLeave={() => this.setState({ hover: -2 })}>
              {editingIndex === val.id ? (
                <EditingRow val={val} onSubmit={this.handleEdit} onCancel={() => this.setState({ editingIndex: -2 })} />
              ) : (
                <Fragment>
                  <StaticRow val={val} />
                  {hover === val.id && (
                    <Fragment>
                      <button
                        type='button'
                        className='btn btn-default btn-outline btn-small'
                        onClick={() => this.setState({ editingIndex: val.id })}>
                        <Octicon name='pencil' />
                      </button>
                      <button type='button' className='btn btn-default btn-outline btn-small' onClick={() => this.handleRemove(val.id)}>
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
      </Card>
    )
  }
}

export default KeyAmountCard
