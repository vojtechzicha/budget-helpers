import React from 'react'
import { Formik } from 'formik'
import Yup from 'yup'
import moment from 'moment'

const Input = ({ name, label, type = 'text', values, errors, touched, handleChange, handleBlur }) => (
  <div className="form-group">
    <label htmlFor={name}>{label}</label>
    <input type={type} className="form-control" id={name} name={name} onChange={handleChange} onBlur={handleBlur} value={values[name]} />
    {touched[name] &&
      errors[name] && (
        <small className="form-text" style={{ color: 'red' }}>
          {' '}
          {errors[name]}{' '}
        </small>
      )}
  </div>
)

const UpsertForm = ({ onSubmit, item }) => (
  <Formik
    initialValues={{
      title: item === null ? '' : item.title,
      invoice_date: moment(item === null ? new Date() : item.invoice.date).format('YYYY-MM-DD'),
      invoice_amount: item === null ? '' : item.invoice.accountingCurrencyAmount,
      warranty: item === null ? '' : item.warranty
    }}
    validationSchema={Yup.object().shape({
      title: Yup.string().required('The title is required'),
      invoice_date: Yup.date().required('You must select a date'),
      invoice_amount: Yup.number().required('You must input invoice amount'),
      warranty: Yup.number().required('The warranty period is required')
    })}
    onSubmit={async (values, { setSubmitting }) => {
      await onSubmit({
        title: values.title,
        warranty: values.warranty,
        invoice: {
          date: moment(values.invoice_date, 'YYYY-MM-DD').toISOString(),
          originalCurrencyAmount: values.invoice_amount,
          accountingCurrencyAmount: values.invoice_amount,
          originalCurrency: 'CZK'
        }
      })
      setSubmitting(false)
    }}
    render={props => {
      const { isSubmitting, handleSubmit } = props
      const inputProps = {
        values: props.values,
        errors: props.errors,
        touched: props.touched,
        handleChange: props.handleChange,
        handleBlur: props.handleBlur
      }
      return (
        <form onSubmit={handleSubmit}>
          <Input name="title" label="Title" {...inputProps} />
          <Input type="number" name="warranty" label="Warranty Period (in months)" {...inputProps} />
          <h3>Invoice</h3>
          <Input type="date" name="invoice_date" label="Date" {...inputProps} />
          <Input type="number" name="invoice_amount" label="Amount" {...inputProps} />
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {item === null ? 'Create' : 'Update'}
          </button>
        </form>
      )
    }}
  />
)

export default UpsertForm
