import React from 'react'
import moment from 'moment'

import Card from './Card'

const Invoice = item => ({
  key: 'invoice',
  rows: 3,
  card: () => (
    <Card title="Invoice">
      <p className="card-text">
        <strong>Date</strong>: {moment(item.invoice.date).format('MMMM Do, YYYY')}
        <br />
        <strong>Amount</strong>: {item.invoice.accountingCurrencyAmount.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK' })}
        <br />
        <strong>Original Amount</strong>:{' '}
        {item.invoice.originalCurrencyAmount.toLocaleString('cs-CZ', { style: 'currency', currency: item.invoice.originalCurrency })}
      </p>
    </Card>
  )
})

export default Invoice
