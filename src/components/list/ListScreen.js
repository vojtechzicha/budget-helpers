import React, { Fragment, Component } from 'react'
import { Link, Redirect } from 'react-router-dom'
import moment from 'moment'
import Octicon from 'react-octicon'

import Header from './../Header'
import DeviceList from './DeviceList'
import UpsertForm from './UpsertForm'

const Filter = ({ onChange, filter, options = [], current = null, isCreate = false, onCreate = null, onBack = null }) => (
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
        {!isCreate &&
          onCreate && (
            <button className="btn btn-secondary" type="button" onClick={onCreate}>
              <Octicon name="plus" />
            </button>
          )}
        {isCreate &&
          onBack && (
            <button className="btn btn-secondary" type="button" onClick={onBack}>
              <Octicon name="arrow-left" />
            </button>
          )}
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
    redirect: null,
    form: null,
    models: []
  }

  componentDidUpdate() {
    if (this.state.redirect !== null) this.setState({ redirect: null })
  }

  itemUrl(id, month = null) {
    if (month === null) {
      month = moment().format('YYYYMM')
    }

    return `item/${id}?absolute&relative=${month}`
  }

  async componentDidMount() {
    this.updateItem(null)
    this.updateModels()
  }

  async componentWillReceiveProps(newProps) {
    if (newProps.match.params.key !== this.props.match.params.key) {
      this.updateItem(newProps.match.params.key)
    }
  }

  async updateItem(id) {
    if (id === null) id = this.props.match.params.key

    const { filterSelector } = this.state
    const { fetch } = this.props

    const [items, item] = await Promise.all([
      fetch('assets', `items?filter=${this.options[filterSelector]}`).then(res => res.json()),
      fetch('assets', this.itemUrl(id)).then(res => res.json())
    ])
    this.setState({
      items,
      item,
      form: 'default'
    })
  }

  async updateModels() {
    const models = await this.props.fetch('assets', 'item-models').then(res => res.json())
    this.setState({ models })
  }

  handleRemove = async () => {
    await this.props.fetch('assets', `item/${this.state.item._id}`, {
      method: 'delete'
    })
    this.setState({ redirect: '/' })
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

  handleUpsertCreateSubmit = async body => {
    return this.props
      .fetch(
        'assets',
        'item',
        {
          method: 'put',
          body: JSON.stringify(body)
        },
        {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      )
      .then(res => res.json())
      .then(res => {
        this.setState({ redirect: `/item/${res.id}` })
      })
  }

  handleUpsertEditSubmit = async body => {
    const { item: { _id } } = this.state

    return this.props
      .fetch(
        'assets',
        `item/${_id}`,
        {
          method: 'post',
          body: JSON.stringify(body)
        },
        {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      )
      .then(res => {
        this.updateItem(_id)
      })
  }

  render() {
    const { match } = this.props
    const { filterSearch, filterSelector, filterLoading, items, item, redirect, form } = this.state

    return redirect !== null ? (
      <Redirect to={redirect} />
    ) : (
      <Fragment>
        <Header match={match} />
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
                      isCreate={form === 'create'}
                      onCreate={() => this.setState({ form: 'create' })}
                      onBack={() => this.setState({ form: 'default' })}
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
              {form === 'create' ? (
                <UpsertForm item={null} onSubmit={this.handleUpsertCreateSubmit} models={this.state.models} />
              ) : item === 'loading' ? (
                <h3>Loading</h3>
              ) : form === 'edit' ? (
                <UpsertForm item={item} onSubmit={this.handleUpsertEditSubmit} models={this.state.models} />
              ) : (
                <DeviceList
                  item={item}
                  onRemove={this.handleRemove}
                  onEdit={() => this.setState({ form: 'edit' })}
                  fetch={this.props.fetch}
                  onUpdate={() => this.updateItem(null)}
                  auth={this.props.auth}
                />
              )}
            </div>
          </div>
        </div>
      </Fragment>
    )
  }
}

export default ListScreen
