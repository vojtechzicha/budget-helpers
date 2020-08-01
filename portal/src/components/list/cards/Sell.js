import React from 'react'
import moment from 'moment'
import { Formik } from 'formik'
import * as Yup from 'yup'
import Octicon from 'react-octicon'

import Card from './Card'

const SoldCard = ({
  item: {
    sell: { date, accountingCurrencyAmount, originalCurrency, originalCurrencyAmount }
  }
}) => (
  <Card title="Sold">
    <p className="card-text">
      <strong>Date</strong>: {moment(date).format('MMMM Do, YYYY')}
      <br />
      <strong>Amount</strong>: {accountingCurrencyAmount.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK' })}
      <br />
      <strong>Original Amount</strong>: {originalCurrencyAmount.toLocaleString('cs-CZ', { style: 'currency', currency: originalCurrency })}
    </p>
  </Card>
)

const InSellCard = ({ item: { _id }, fetch, onUpdate }) => (
  <Card title="Sale Details">
    <Formik
      initialValues={{ date: moment().format('YYYY-MM-DD'), amount: '' }}
      validationSchema={Yup.object().shape({
        date: Yup.date().required('A date is required'),
        amount: Yup.number().required('Amount is required')
      })}
      onSubmit={async (values, { setSubmitting }) => {
        await fetch(
          'assets',
          `item/${_id}`,
          {
            method: 'post',
            body: JSON.stringify({
              inSell: false,
              sell: {
                date: moment(values.date, 'YYYY-MM-DD').toISOString(),
                originalCurrency: 'CZK',
                originalCurrencyAmount: values.amount,
                accountingCurrencyAmount: values.amount
              }
            })
          },
          {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        )

        onUpdate()
        setSubmitting(false)
      }}
      render={({ isSubmitting, handleSubmit, values, errors, touched, handleChange, handleBlur }) => (
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="col">
              <input
                type="date"
                className="form-control"
                placeholder="Sell date"
                name="date"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.date}
              />
            </div>
            <div className="col">
              <input
                type="number"
                className="form-control"
                placeholder="Amount"
                name="amount"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.amount}
              />
            </div>
            <div className="col">
              <button type="submit" className="btn btn-primary btn-small" disabled={isSubmitting}>
                <Octicon name="check" />
              </button>
              <button
                type="button"
                className="btn btn-default btn-small"
                onClick={async () => {
                  await fetch(
                    'assets',
                    `item/${_id}`,
                    {
                      method: 'post',
                      body: JSON.stringify({
                        inSell: false
                      })
                    },
                    {
                      Accept: 'application/json',
                      'Content-Type': 'application/json'
                    }
                  )

                  onUpdate()
                }}>
                <Octicon name="x" />
              </button>
            </div>
          </div>
        </form>
      )}
    />
  </Card>
)

const Sell = item => ({
  key: 'sell',
  new: {
    label: 'Mark as Sold',
    key: 'sell',
    handleNew: async (item, fetch) => {
      const { _id } = item

      await fetch(
        'assets',
        `item/${_id}`,
        {
          method: 'post',
          body: JSON.stringify({
            inSell: true
          })
        },
        {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      )
    }
  },
  rows: (item.sell !== undefined && item.sell !== null) || item.inSell === true ? 3 : 0,
  card: (fetch, onUpdate) =>
    item.inSell === true ? <InSellCard item={item} onUpdate={onUpdate} fetch={fetch} /> : <SoldCard item={item} />
})

export default Sell
