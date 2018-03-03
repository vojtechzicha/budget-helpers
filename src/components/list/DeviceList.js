import React from 'react'
import Octicon from 'react-octicon'

const DeviceDetail = ({ item }) => {
  const cards = Object.values(require('./cards'))
    .map(card => card(item))
    .filter(card => card.rows > 0)

  let cols = [[], [], []]
  cards.forEach(card => {
    cols[
      cols
        .map((clist, index) => ({
          rows: clist.reduce((pr, cu) => pr + cu.rows, 0) + clist.length * 5,
          index
        }))
        .reduce((pr, cu) => (pr === null || cu.rows < pr.rows ? cu : pr), null).index
    ].push(card)
  })

  return (
    <div className="row">
      {cols.map((col, index) => (
        <div key={index} className="col-sm-4">
          {col.map(card => (
            <div key={card.key} style={{ marginTop: '.5em' }}>
              {card.card()}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

const Toolbar = ({ onEdit, enableEdit, onRemove, onUpload = null }) => (
  <div className="text-center">
    <div className="btn-group" role="group" aria-label="Toolbar">
      <button type="button" className="btn btn-danger" onClick={onRemove}>
        Remove
      </button>
    </div>
  </div>
)

const DeviceList = ({ item, onRemove, onEditMode }) => {
  const tool = <Toolbar onRemove={onRemove} />

  return (
    <div>
      <h2>
        {item.title}{' '}
        <button type="button" className="btn btn-default btn-outline" onClick={() => onEditMode()}>
          <Octicon mega name="pencil" />
        </button>
      </h2>
      <DeviceDetail item={item} />
      <hr />
      {tool}
    </div>
  )
}

export default DeviceList
