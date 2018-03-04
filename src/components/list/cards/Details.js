import React from 'react'

import KeyValueCard from './KeyValueCard'

const Details = item => ({
  key: 'details',
  rows: item.details === undefined ? 0 : item.details.length,
  card: fetch => (
    <KeyValueCard
      item={item}
      itemKey="details"
      label="Details"
      fetch={fetch}
      handleRemove={async (item, i) => {
        const { _id, details } = item

        const newDetails = [...details.slice(0, i), ...details.slice(i + 1)]

        await fetch(
          'assets',
          `item/${_id}`,
          {
            method: 'post',
            body: JSON.stringify({
              details: newDetails
            })
          },
          {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        )

        return newDetails
      }}
      handleEdit={async (item, i, detail) => {
        const { _id, details } = item

        const newDetails = [...details.slice(0, i), detail, ...details.slice(i + 1)]

        await fetch(
          'assets',
          `item/${_id}`,
          {
            method: 'post',
            body: JSON.stringify({
              details: newDetails
            })
          },
          {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        )

        return newDetails
      }}
      handleCreate={async item => {
        const { _id, details } = item

        const newDetails = [...details, { key: '', value: '' }]

        await fetch(
          'assets',
          `item/${_id}`,
          {
            method: 'post',
            body: JSON.stringify({
              details: newDetails
            })
          },
          {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        )

        return newDetails
      }}
    />
  )
})

export default Details
