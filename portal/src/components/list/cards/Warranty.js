import React from 'react'
import moment from 'moment'

import Card from './Card'

export const ExpiredWarranty = item => ({
  key: 'expired-warranty',
  rows: moment().isAfter(moment(item.invoice.date).add(item.warranty, 'months')) ? 3 : 0,
  card: () => (
    <Card
      title="Warranty"
      subtitle={`Expired ${moment(item.invoice.date)
        .add(item.warranty, 'months')
        .fromNow()}`}
      border="danger">
      <p className="card-text">
        <strong>Warranty Period</strong>: {item.warranty} months<br />
        <strong>Warranty Expired</strong>:{' '}
        {moment(item.invoice.date)
          .add(item.warranty, 'months')
          .format('MMMM Do, YYYY')}
      </p>
    </Card>
  )
})

export const ValidWarranty = item => ({
  key: 'valid-warranty',
  rows: moment().isAfter(moment(item.invoice.date).add(item.warranty, 'months')) ? 0 : 3,
  card: () => (
    <Card
      title="Warranty"
      subtitle={`Valid, expires ${moment(item.invoice.date)
        .add(item.warranty, 'months')
        .fromNow()}`}
      border={
        moment()
          .add(Math.floor(item.warranty / 3), 'months')
          .isAfter(moment(item.invoice.date).add(item.warranty, 'months'))
          ? 'warning'
          : 'success'
      }>
      <p className="card-text">
        <strong>Warranty Period</strong>: {item.warranty} months<br />
        <strong>Warranty Expires</strong>:{' '}
        {moment(item.invoice.date)
          .add(item.warranty, 'months')
          .format('MMMM Do, YYYY')}
      </p>
    </Card>
  )
})
