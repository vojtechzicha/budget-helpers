import React, { Fragment, Component } from 'react'
import { Formik } from 'formik'
import Yup from 'yup'
import Octicon from 'react-octicon'

import Card from './Card'

const StaticRow = ({ val }) => (
  <Fragment>
    <strong>{val.key}</strong>: {val.value}
  </Fragment>
)

const EditingRow = ({ i, val, onSubmit, onCancel }) => (
  <Formik
    initialValues={{ key: val.key, value: val.value }}
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

class KeyValueCard extends Component {
  state = {
    editingIndex: -2,
    hover: false
  }

  handleEdit = async (i, val) => {
    const { itemKey, handleEdit, item } = this.props

    const newVal = await handleEdit(item, i, val)

    this.setState({
      editingIndex: -2
    })
  }

  handleCreate = async () => {
    const { item } = this.state
    const { itemKey, handleCreate } = this.props

    const newVal = await handleCreate(item)

    this.setState({
      editingIndex: newVal.length - 1
    })
  }

  handleRemove = async (i, val) => {
    const { item } = this.state
    const { itemKey, handleRemove } = this.props

    const newVal = await handleRemove(item, i)
  }

  render() {
    const { editingIndex, hover } = this.state
    const { itemKey, label, item } = this.props

    return (
      <Card
        title={
          <span onMouseEnter={() => this.setState({ hover: -1 })} onMouseLeave={() => this.setState({ hover: -2 })}>
            {label}{' '}
            {hover === -1 && (
              <button type="button" className="btn btn-default btn-outline btn-small" onClick={this.handleCreate}>
                <Octicon name="plus" />
              </button>
            )}
          </span>
        }>
        <div className="card-text">
          {item[itemKey].map((val, i) => (
            <div key={i} onMouseEnter={() => this.setState({ hover: i })} onMouseLeave={() => this.setState({ hover: -2 })}>
              {editingIndex === i ? (
                <EditingRow i={i} val={val} onSubmit={this.handleEdit} onCancel={() => this.setState({ editingIndex: -2 })} />
              ) : (
                <Fragment>
                  <StaticRow val={val} />
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

export default KeyValueCard
