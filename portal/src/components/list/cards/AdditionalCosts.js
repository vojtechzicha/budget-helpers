import React from 'react'
import { v4 as uuid} from 'uuid'

import KeyAmountCard from './KeyAmountCard'

const generateNewCost = () => ({
  id: uuid(),
  type: 'New',
  name: 'New',
  originalCurrencyAmount: 0,
  originalCurrency: 'CZK',
  accountingCurrencyAmount: 0,
  invoiceDate: new Date().toISOString()
})

const AdditionalCosts = item => ({
  key: 'additionalCosts',
  rows: item.additionalCosts === undefined ? 0 : item.additionalCosts.length * 4,
  new: {
    label: 'Additional Cost',
    key: 'additionalCosts',
    handleNew: async (item, fetch) => {
      const { _id } = item

      await fetch(
        'assets',
        `item/${_id}`,
        {
          method: 'post',
          body: JSON.stringify({
            additionalCosts: [generateNewCost()]
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
    <KeyAmountCard
      item={item}
      itemKey="additionalCosts"
      label="Additional Costs"
      handleRemove={async (item, id) => {
        const { _id, additionalCosts } = item

        const newAdditionalCosts = additionalCosts.filter(acc => acc.id !== id)

        await fetch(
          'assets',
          `item/${_id}`,
          {
            method: 'post',
            body: JSON.stringify({
              additionalCosts: newAdditionalCosts
            })
          },
          {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        )

        return newAdditionalCosts
      }}
      handleEdit={async (item, id, additionalCost) => {
        const { _id, additionalCosts } = item

        const newAdditionalCosts = [
          ...additionalCosts.filter(acc => acc.id !== id),
          {
            ...additionalCosts.find(acc => acc.id === id),
            ...additionalCost
          }
        ]

        await fetch(
          'assets',
          `item/${_id}`,
          {
            method: 'post',
            body: JSON.stringify({
              additionalCosts: newAdditionalCosts
            })
          },
          {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        )

        return newAdditionalCosts
      }}
      handleCreate={async item => {
        const { _id, additionalCosts } = item

        const newAdditionalCosts = [...additionalCosts, generateNewCost()]

        await fetch(
          'assets',
          `item/${_id}`,
          {
            method: 'post',
            body: JSON.stringify({
              additionalCosts: newAdditionalCosts
            })
          },
          {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        )

        return newAdditionalCosts
      }}
    />
  )
})

export default AdditionalCosts
