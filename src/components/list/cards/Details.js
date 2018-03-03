import React, { Fragment, Component } from 'react'
import { Formik } from 'formik'
import Yup from 'yup'
import Octicon from 'react-octicon'

import Card from './Card'

const StaticRow = ({ detail }) => (
  <Fragment>
    <strong>{detail.key}</strong>: {detail.value}
  </Fragment>
)

const EditingRow = ({ i, detail, onSubmit, onCancel }) => (
  <Formik
    initialValues={{ key: detail.key, value: detail.value }}
    validationSchema={Yup.object().shape({
      key: Yup.string().required('key must be provided'),
      value: Yup.string().required('value must be provided')
    })}
    onSubmit={async (values, { setSubmitting }) => {
      await onSubmit(i, values)
      setSubmitting(false)
    }}
    render={({ isSubmitting, handleSubmit, values, errors, touched, handleChange, handleBlur }) => (
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="vey"
              name="key"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.key}
              style={{ fontWeight: 'bold' }}
            />
          </div>
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="value"
              name="value"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.value}
            />
          </div>
          <div className="col">
            <button type="submit" className="btn btn-primary btn-small" disabled={isSubmitting}>
              <Octicon name="check" />
            </button>
            <button type="button" className="btn btn-default btn-small" onClick={onCancel}>
              <Octicon name="x" />
            </button>
          </div>
        </div>
      </form>
    )}
  />
)

class DetailsCard extends Component {
  state = {
    editingIndex: -2,
    hover: false,
    item: this.props.item
  }

  handleRemove = async i => {
    const { fetch } = this.props
    const { item } = this.state
    const { _id, details } = item

    const newDetails = [...details.slice(0, i), ...details.slice(i + 1)]

    await fetch(
      'assets',
      `item/${_id}`,
      {
        method: 'post',
        body: JSON.stringify({
          details: newDetails
        })
      },
      {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    )

    this.setState({
      item: { ...item, details: newDetails }
    })
  }

  handleEdit = async (i, detail) => {
    const { fetch } = this.props
    const { item } = this.state
    const { _id, details } = item

    const newDetails = [...details.slice(0, i), detail, ...details.slice(i + 1)]

    await fetch(
      'assets',
      `item/${_id}`,
      {
        method: 'post',
        body: JSON.stringify({
          details: newDetails
        })
      },
      {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    )

    this.setState({
      item: { ...item, details: newDetails },
      editingIndex: -2
    })
  }

  handleCreate = async () => {
    const { fetch } = this.props
    const { item } = this.state
    const { _id, details } = item

    const newDetails = [...details, { key: '', value: '' }]

    await fetch(
      'assets',
      `item/${_id}`,
      {
        method: 'post',
        body: JSON.stringify({
          details: newDetails
        })
      },
      {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    )

    this.setState({
      item: { ...item, details: newDetails },
      editingIndex: newDetails.length - 1
    })
  }

  render() {
    const { editingIndex, hover, item } = this.state

    return (
      <Card
        title={
          <span onMouseEnter={() => this.setState({ hover: -1 })} onMouseLeave={() => this.setState({ hover: -2 })}>
            Details{' '}
            {hover === -1 && (
              <button type="button" className="btn btn-default btn-outline btn-small" onClick={this.handleCreate}>
                <Octicon name="plus" />
              </button>
            )}
          </span>
        }>
        <div className="card-text">
          {item.details.map((detail, i) => (
            <div key={i} onMouseEnter={() => this.setState({ hover: i })} onMouseLeave={() => this.setState({ hover: -2 })}>
              {editingIndex == i ? (
                <EditingRow i={i} detail={detail} onSubmit={this.handleEdit} onCancel={() => this.setState({ editingIndex: -2 })} />
              ) : (
                <Fragment>
                  <StaticRow detail={detail} />
                  {hover === i && (
                    <Fragment>
                      <button
                        type="button"
                        className="btn btn-default btn-outline btn-small"
                        onClick={() => this.setState({ editingIndex: i })}>
                        <Octicon name="pencil" />
                      </button>
                      <button type="button" className="btn btn-default btn-outline btn-small" onClick={() => this.handleRemove(i)}>
                        <Octicon name="trashcan" />
                      </button>
                    </Fragment>
                  )}
                  <br />
                </Fragment>
              )}
            </div>
          ))}
        </div>
      </Card>
    )
  }
}

const Details = item => ({
  key: 'details',
  rows: item.details === undefined ? 0 : item.details.length,
  card: fetch => <DetailsCard item={item} fetch={fetch} />
})

export default Details
