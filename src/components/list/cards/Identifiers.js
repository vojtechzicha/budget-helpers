import React from 'react'

import KeyValueCard from './KeyValueCard'

const Identifiers = item => ({
  key: 'ids',
  rows: item.ids === undefined ? 0 : item.ids.length,
  new: {
    label: 'Identifier',
    key: 'ids',
    handleNew: async (item, fetch) => {
      const { _id } = item

      await fetch(
        'assets',
        `item/${_id}`,
        {
          method: 'post',
          body: JSON.stringify({
            ids: [{ key: '', value: '' }]
          })
        },
        {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      )
    }
  },
  card: fetch => (
    <KeyValueCard
      item={item}
      itemKey="ids"
      label="Identifiers"
      fetch={fetch}
      handleRemove={async (item, i) => {
        const { _id, ids } = item

        const newIds = [...ids.slice(0, i), ...ids.slice(i + 1)]

        await fetch(
          'assets',
          `item/${_id}`,
          {
            method: 'post',
            body: JSON.stringify({
              ids: newIds
            })
          },
          {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        )

        return newIds
      }}
      handleEdit={async (item, i, id) => {
        const { _id, ids } = item

        const newIds = [...ids.slice(0, i), id, ...ids.slice(i + 1)]

        await fetch(
          'assets',
          `item/${_id}`,
          {
            method: 'post',
            body: JSON.stringify({
              ids: newIds
            })
          },
          {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        )

        return newIds
      }}
      handleCreate={async item => {
        const { _id, ids } = item

        const newIds = [...ids, { key: '', value: '' }]

        await fetch(
          'assets',
          `item/${_id}`,
          {
            method: 'post',
            body: JSON.stringify({
              ids: newIds
            })
          },
          {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        )

        return newIds
      }}
    />
  )
})

export default Identifiers
