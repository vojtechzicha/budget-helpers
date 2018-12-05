import React from 'react'
import uuid from 'uuid/v4'

import KeyAmountCard from './KeyAmountCard'

const generateNewAccessory = () => ({
  id: uuid(),
  type: 'New',
  name: 'New',
  originalCurrencyAmount: 0,
  originalCurrency: 'CZK',
  accountingCurrencyAmount: 0,
  invoiceDate: new Date().toISOString()
})

const Accessories = item => ({
  key: 'accessories',
  rows: item.accessories === undefined ? 0 : item.accessories.length * 4,
  new: {
    label: 'Accessory',
    key: 'accessories',
    handleNew: async (item, fetch) => {
      const { _id } = item

      await fetch(
        'assets',
        `item/${_id}`,
        {
          method: 'post',
          body: JSON.stringify({
            accessories: [generateNewAccessory()]
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
      itemKey="accessories"
      label="Accessories"
      handleRemove={async (item, id) => {
        const { _id, accessories } = item

        const newAccessories = accessories.filter(acc => acc.id !== id)

        await fetch(
          'assets',
          `item/${_id}`,
          {
            method: 'post',
            body: JSON.stringify({
              accessories: newAccessories
            })
          },
          {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        )

        return newAccessories
      }}
      handleEdit={async (item, id, accessory) => {
        const { _id, accessories } = item

        const newAccessories = [
          ...accessories.filter(acc => acc.id !== id),
          {
            ...accessories.find(acc => acc.id === id),
            ...accessory
          }
        ]

        await fetch(
          'assets',
          `item/${_id}`,
          {
            method: 'post',
            body: JSON.stringify({
              accessories: newAccessories
            })
          },
          {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        )

        return newAccessories
      }}
      handleCreate={async item => {
        const { _id, accessories } = item

        const newAccessories = [...accessories, generateNewAccessory()]

        await fetch(
          'assets',
          `item/${_id}`,
          {
            method: 'post',
            body: JSON.stringify({
              accessories: newAccessories
            })
          },
          {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        )

        return newAccessories
      }}
    />
  )
})

export default Accessories
