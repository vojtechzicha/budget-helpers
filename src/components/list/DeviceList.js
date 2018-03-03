import React, { Component, Fragment } from 'react'
import Octicon from 'react-octicon'

const DeviceDetail = ({ item, fetch }) => {
  const cards = require('./cards/index')
    .default.map(card => card(item))
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
              {card.card(fetch)}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

class DeviceList extends Component {
  state = {
    showControls: false
  }

  render() {
    const { item, onRemove, onEdit, fetch } = this.props

    return (
      <div>
        <h2 onMouseEnter={() => this.setState({ showControls: true })} onMouseLeave={() => this.setState({ showControls: false })}>
          {item.title}
          {this.state.showControls ? (
            <Fragment>
              <button type="button" className="btn btn-default btn-outline" onClick={() => onEdit()}>
                <Octicon mega name="pencil" />
              </button>
              <button type="button" className="btn btn-default btn-outline" onClick={() => onRemove()}>
                <Octicon mega name="trashcan" />
              </button>
            </Fragment>
          ) : null}
        </h2>
        <DeviceDetail item={item} fetch={fetch} />
      </div>
    )
  }
}

export default DeviceList
