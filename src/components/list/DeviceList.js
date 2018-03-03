import React, { Component } from 'react'

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

class ContentEditable extends Component {
  lastValue = ''
  pre = null

  shouldComponentUpdate(nextProps) {
    return nextProps.value !== this.pre.innerText
  }

  emitChange = () => {
    const value = this.pre.innerText
    if (this.props.onChange && value !== this.lastValue) {
      this.props.onChange({ target: { value } })
      this.lastValue = value
    }
  }

  render() {
    return (
      <pre
        onInput={this.emitChange}
        onBlur={this.emitChange}
        contentEditable
        suppressContentEditableWarning="true"
        ref={dom => {
          this.pre = dom
        }}>
        {this.props.value}
      </pre>
    )
  }
}

const Toolbar = ({ onEdit, enableEdit, onRemove, onUpload = null }) => (
  <div className="text-center">
    <div className="btn-group" role="group" aria-label="Toolbar">
      <button type="button" className="btn btn-primary" disabled={!enableEdit} onClick={onEdit}>
        Edit
      </button>
      <button type="button" className="btn btn-danger" onClick={onRemove}>
        Remove
      </button>
      {onUpload && (
        <button type="button" className="btn btn-secondary" onClick={onUpload}>
          Upload Document
        </button>
      )}
    </div>
  </div>
)

const DeviceList = ({ item, onEdit, editError, onRemove, prepareEdit, onEditChange }) => {
  const tool = <Toolbar onEdit={onEdit} enableEdit={!editError} onRemove={onRemove} />

  return (
    <div>
      <h2>{item.title}</h2>
      <DeviceDetail item={item} />
      <hr />
      {tool}
      <hr />
      {editError && <strong>Error in jSON</strong>}
      <ContentEditable value={prepareEdit(item)} onChange={onEditChange} />
      <hr />
      {tool}
      <hr />
      <form
        id="uploadForm"
        action={`${process.env.REACT_APP_SERVER_URI}assets/item/${item._id}/document`}
        method="post"
        encType="multipart/form-data">
        <input type="file" name="document" />
        <input type="submit" value="Upload" />
      </form>
    </div>
  )
}

export default DeviceList
