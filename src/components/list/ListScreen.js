import React, { Fragment, Component } from 'react'
import { Link, Redirect } from 'react-router-dom'
import moment from 'moment'

import Header from './../Header'

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

const Toolbar = ({ onEdit, enableEdit, onRemove, onUpload }) => (
  <div className="text-center">
    <div className="btn-group" role="group" aria-label="Toolbar">
      <button type="button" className="btn btn-primary" disabled={!enableEdit} onClick={onEdit}>
        Edit
      </button>
      <button type="button" className="btn btn-danger" onClick={onRemove}>
        Remove
      </button>
      <button type="button" className="btn btn-secondary" onClick={onUpload}>
        Upload Document
      </button>
    </div>
  </div>
)

const Filter = ({ onChange, filter, options = [], current = null }) => (
  <div className="input-group mb-3">
    <input
      type="text"
      className="form-control"
      placeholder="filter"
      aria-label="filter"
      aria-describedby="basic-addon1"
      onChange={e => onChange({ filter: e.currentTarget.value, selector: current })}
    />
    {options.length > 0 && (
      <div className="input-group-append">
        <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown">
          {current}
        </button>
        <div className="dropdown-menu">
          {options.filter(option => option !== current).map(
            (option, index) =>
              option === '-' ? (
                <div key={index} role="separator" className="dropdown-divider" />
              ) : (
                <button className="dropdown-item" key={option} onClick={() => onChange({ filter, selector: option })}>
                  {option}
                </button>
              )
          )}
        </div>
      </div>
    )}
  </div>
)

class ListScreen extends Component {
  options = {
    All: 'all',
    Active: 'active',
    'Soon OOW': 'soonoow',
    'Being Sold': 'being sold'
  }

  state = {
    filterSearch: '',
    filterSelector: 'Active',
    filterLoading: false,
    items: [],
    item: 'loading',
    edit: '',
    editError: false,
    redirect: null
  }

  prepareEdit(obj) {
    return JSON.stringify({ ...obj, calculation: undefined, _id: undefined /*, documents: undefined*/ }, null, 2)
  }

  componentDidUpdate() {
    if (this.state.redirect !== null) this.setState({ redirect: null })
  }

  itemUrl(id, month = null) {
    if (month === null) {
      month = moment().format('YYYYMM')
    }

    // return `item/${id}?absolute&relative=${month}`
    return `item/${id}`
  }

  async componentDidMount() {
    const { match: { params }, fetch } = this.props
    const { filterSelector } = this.state

    const [items, item] = await Promise.all([
      fetch('assets', `items?filter=${this.options[filterSelector]}`).then(res => res.json()),
      fetch('assets', this.itemUrl(params.key)).then(res => res.json())
    ])
    this.setState({
      items,
      item,
      edit: this.prepareEdit(item),
      editError: false
    })
  }

  async componentWillReceiveProps(newProps) {
    if (newProps.match.params.key !== this.props.match.params.key) {
      this.updateItem(newProps.match.params.key)
    }
  }

  async updateItem(key) {
    const item = await this.props.fetch('assets', this.itemUrl(key)).then(res => res.json())
    this.setState({
      item,
      edit: this.prepareEdit(item),
      editError: false
    })
  }

  handleEditChange = e => {
    try {
      this.setState({ edit: this.prepareEdit(JSON.parse(e.target.value)), editError: false })
    } catch (e) {
      this.setState({ editError: true })
    }
  }

  handleEdit = async () => {
    const { item: { _id }, edit } = this.state

    await this.props
      .fetch(
        'assets',
        `item/${_id}`,
        {
          method: 'post',
          body: JSON.stringify({
            ...JSON.parse(edit) /*,
        documents: this.state.item.documents*/
          })
        },
        {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      )
      .then(res => res.json())
    this.updateItem(_id)
  }

  handleRemove = async () => {
    await fetch(`${process.env.REACT_APP_SERVER_URI}assets/item/${this.state.item._id}`, {
      method: 'delete'
    })
    this.setState({ redirect: '/' })
  }

  handleCreate = async () => {
    const doc = await fetch(`${process.env.REACT_APP_SERVER_URI}assets/item`, {
      method: 'put'
    }).then(res => res.json())
    this.setState({ redirect: `/item/${doc._id}` })
  }

  handleFilterChange = async ({ filter, selector }) => {
    if (selector !== this.state.filterSelector) {
      this.setState({ filterLoading: true })
      const items = await fetch(`${process.env.REACT_APP_SERVER_URI}assets/items?filter=${this.options[selector]}`).then(res => res.json())
      if (items.map(i => i._id).includes(this.state.item._id)) {
        this.setState({ filterSearch: '', filterSelector: selector, filterLoading: false, items })
      } else {
        this.setState({ filterSearch: '', filterSelector: selector, filterLoading: false, items, redirect: '/' })
      }
    } else {
      this.setState({ filterSearch: filter, filterSelector: selector })
    }
  }

  render() {
    const { match } = this.props
    const { filterSearch, filterSelector, filterLoading, items, item, editError, redirect } = this.state

    const tool = <Toolbar onEdit={this.handleEdit} enableEdit={!editError} onRemove={this.handleRemove} />

    return redirect !== null ? (
      <Redirect to={redirect} />
    ) : (
      <Fragment>
        <Header match={match}>
          <button type="button" className="btn btn-success" onClick={this.handleCreate}>
            Create
          </button>
        </Header>
        <div className="container-fluid" style={{ marginTop: '1em' }}>
          <div className="row">
            <div className="col-sm-3">
              <ul className="list-group">
                <li className="list-group-item">
                  {filterLoading ? (
                    'Loading...'
                  ) : (
                    <Filter
                      filter={filterSearch}
                      onChange={this.handleFilterChange}
                      current={filterSelector}
                      options={Object.keys(this.options)}
                    />
                  )}
                </li>
                {items
                  .filter(i => i.title.toLowerCase().includes(filterSearch.toLowerCase()))
                  .sort((a, b) => (a.title < b.title ? -1 : 1))
                  .map(i => (
                    <li key={i._id} className="list-group-item">
                      {i._id === item._id ? (
                        <span className="mb-2 text-muted" style={{ fontSize: 'smaller' }}>
                          <strong>{item.title}</strong>
                        </span>
                      ) : (
                        <Link to={`/item/${i._id}`} className="mb-2 text-muted" style={{ fontSize: 'smaller' }}>
                          {i.title}
                        </Link>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
            <div className="col-sm-9">
              {item === 'loading' ? (
                <h3>Loading</h3>
              ) : (
                <div>
                  <h2>{item.title}</h2>
                  <DeviceDetail item={item} />
                  <hr />
                  {tool}
                  <hr />
                  {editError && <strong>Error in jSON</strong>}
                  <ContentEditable value={this.prepareEdit(item)} onChange={this.handleEditChange} />
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
              )}
            </div>
          </div>
        </div>
      </Fragment>
    )
  }
}

export default ListScreen
