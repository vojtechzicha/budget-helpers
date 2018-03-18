import React, { Component, Fragment } from 'react'
import Octicon from 'react-octicon'

class DeviceList extends Component {
  cards = require('./cards/index')

  state = {
    showControls: true
  }

  render() {
    const { item, onRemove, onEdit, fetch, onUpdate } = this.props

    const cards = this.cards.default.map(card => card(item))
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

    const buttons = cards.filter(card => card.rows === 0 && card.new !== undefined).map(card => card.new)
    return (
      <div>
        <h2>
          {item.title}
          {this.state.showControls ? (
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
                  {card.card(fetch, onUpdate, this.props.auth)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default DeviceList
