import React from 'react'
import moment from 'moment'

import Card from './Card'
import { formatCurrency } from '../../../helpers'

export const SerialKey = item => ({
  key: 'serial-key',
  rows: item.serialKey !== undefined && item.serialKey !== null ? 1 : 0,
  card: () => <Card title="Serial Key" subtitle={item.serialKey} />
})

export const Invoice = item => ({
  key: 'invoice',
  rows: 3,
  card: () => (
    <Card title="Invoice">
      <p className="card-text">
        <strong>Date</strong>: {moment(item.invoice.date).format('MMMM Do, YYYY')}
        <br />
        <strong>Amount</strong>: {formatCurrency(item.invoice.accountingCurrencyAmount)}
        <br />
        <strong>Original Amount</strong>: {formatCurrency(item.invoice.originalCurrencyAmount, ` ${item.invoice.originalCurrency}`)}
      </p>
    </Card>
  )
})
