import React, { Fragment, useState, useEffect, useContext } from 'react'
import { Link, Redirect } from 'react-router-dom'
import moment from 'moment'
import Octicon from 'react-octicon'

import Header from './../Header'
import DeviceList from './DeviceList'
import UpsertForm from './UpsertForm'
import context from '../../context'

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
          {options
            .filter(option => option !== current)
            .map((option, index) =>
              option === '-' ? (
                <div key={index} role="separator" className="dropdown-divider" />
              ) : (
                <button className="dropdown-item" key={option} onClick={() => onChange({ filter, selector: option })}>
                  {option}
                </button>
              )
            )}
        </div>
        {!isCreate && onCreate && (
          <button className="btn btn-secondary" type="button" onClick={onCreate}>
            <Octicon name="plus" />
          </button>
        )}
        {isCreate && onBack && (
          <button className="btn btn-secondary" type="button" onClick={onBack}>
            <Octicon name="arrow-left" />
          </button>
        )}
      </div>
    )}
  </div>
)

const options = {
  All: 'all',
  Active: 'active',
  'Soon OOW': 'soonoow',
  'Being Sold': 'being sold'
}

const ListScreen = ({ match }) => {
  const [filter, setFilter] = useState({
    search: '',
    selector: 'Active',
    loading: false
  })
  const [items, setItems] = useState([])
  const [item, setItem] = useState('loading')
  const [redirect, setRedirect] = useState(null)
  const [form, setForm] = useState(null)
  const [models, setModels] = useState([])
  const { fetch, auth } = useContext(context)

  useEffect(() => {
     if (redirect !== null) {
      setRedirect(null)
    }
  }, [redirect])

  const itemUrl = (id, month = null) => {
    if (month === null) {
      month = moment().format('YYYYMM')
    }

    return `item/${id}?absolute&relative=${month}`
  }

  useEffect(() => {
    ;(async () => {
      const id = match.params.key

      const [items, item] = await Promise.all([
        fetch('assets', `items?filter=${options[filter.selector]}`).then(res => res.json()),
        fetch('assets', itemUrl(id)).then(res => res.json())
      ])

      setItems(items)
      setItem(item)
      setForm('default')
    })()
  }, [fetch, filter.selector, match.params.key])

  useEffect(() => {
    ;(async () => {
      setModels(await fetch('assets', 'item-models').then(res => res.json()))
    })()
  }, [fetch])

  const handleRemove = async () => {
    await fetch('assets', `item/${item._id}`, {
      method: 'delete'
    })
    setRedirect('/')
  }

  const handleFilterChange = async ({ newFilter, selector }) => {
     if (selector !== filter.selector) {
      setFilter(filter => ({ ...filter, loading: true }))
      const newItems = await fetch(`${process.env.REACT_APP_SERVER_URI}assets/items?filter=${options[selector]}`).then(res => res.json())

      if (newItems.map(i => i._id).includes(item._id)) {
        setFilter({ search: '', selector, loading: false })
        setItems(newItems)
      } else {
        setFilter({ search: '', selector, loading: false })
        setItems(newItems)
        setRedirect('/')
      }
    } else {
      setFilter(filter => ({ ...filter, search: newFilter, selector }))
    }
  }

  const handleUpsertCreateSubmit = async body =>
    fetch(
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
        setRedirect(`/item/${res.id}`)
      })

  const handleUpsertEditSubmit = async body =>
    fetch(
      'assets',
      `item/${item._id}`,
      {
        method: 'post',
        body: JSON.stringify(body)
      },
      {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    ).then(res => {
      setRedirect(`/item/${res.id}`)
    })

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
                {filter.loading ? (
                  'Loading...'
                ) : (
                  <Filter
                    filter={filter.search}
                    onChange={handleFilterChange}
                    current={filter.selector}
                    options={Object.keys(options)}
                    isCreate={form === 'create'}
                    onCreate={() => setForm('create')}
                    onBack={() => setForm('default')}
                  />
                )}
              </li>
              {items
                .filter(i => i.title.toLowerCase().includes(filter.search.toLowerCase()))
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
              <UpsertForm item={null} onSubmit={handleUpsertCreateSubmit} models={models} />
            ) : item === 'loading' ? (
              <div className="loader" />
            ) : form === 'edit' ? (
              <UpsertForm item={item} onSubmit={handleUpsertEditSubmit} models={models} />
            ) : (
              <DeviceList
                item={item}
                onRemove={handleRemove}
                onEdit={() => setForm('edit')}
                onUpdate={() => setRedirect('/')}
                auth={auth}
              />
            )}
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default ListScreen
