import React, { Fragment, useState, useContext } from 'react'
import Octicon from 'react-octicon'
import context from '../../context'

const DeviceList = ({ item, onRemove, onEdit, onUpdate }) => {
  const allCards = require('./cards/index')
  const [showControls] = useState(true)
  const { fetch, auth } = useContext(context)

  const cards = allCards.default.map(card => card(item))
  const activeCards = cards.filter(card => card.rows > 0)

  let cols = [[], [], []]
  activeCards.forEach(card => {
    cols[
      cols
        .map((clist, index) => ({
          rows: clist.reduce((pr, cu) => pr + cu.rows, 0) + clist.length * 5,
          index
        }))
        .reduce((pr, cu) => (pr === null || cu.rows < pr.rows ? cu : pr), null).index
    ].push(card)
  })

  let buttons = cards.filter(card => card.rows === 0 && card.new !== undefined).map(card => card.new)
  buttons.sort((a, b) => (a.label > b.label ? 1 : a.label < b.label ? -1 : 0))
  return (
    <div>
      <h2>
        {item.title}
        {showControls ? (
          <Fragment>
            <button type="button" className="btn btn-default btn-outline" onClick={() => onEdit()}>
              <Octicon mega name="pencil" />
            </button>
            <button type="button" className="btn btn-default btn-outline" onClick={() => onRemove()}>
              <Octicon mega name="trashcan" />
            </button>
            {buttons.length > 0 && (
              <Fragment>
                <button className="btn btn-default btn-outline dropdown-toggle" type="button" data-toggle="dropdown">
                  <Octicon mega name="plus" />
                </button>
                <div className="dropdown-menu">
                  {buttons.map(button => (
                    <button
                      className="dropdown-item"
                      key={button.key}
                      onClick={async () => {
                        await button.handleNew(item, fetch)
                        onUpdate()
                      }}>
                      {button.label}
                    </button>
                  ))}
                </div>
              </Fragment>
            )}
          </Fragment>
        ) : null}
      </h2>
      <div className="row">
        {cols.map((col, index) => (
          <div key={index} className="col-sm-4">
            {col.map(card => (
              <div key={card.key} style={{ marginTop: '.5em' }}>
                {card.card(fetch, onUpdate, auth)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeviceList
