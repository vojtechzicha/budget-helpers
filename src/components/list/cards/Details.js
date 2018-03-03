import React, { Fragment, Component } from 'react'
import Formik from 'formik'
import Yup from 'yup'

import Card from './Card'

class DetailsCard extends Component {
  state = {
    editingIndex: 1
  }

  render() {
    const { item } = this.props

    return (
      <Card title={<span>Details</span>}>
        <p className="card-text">
          {Object.keys(item.details)
            .map(key => ({ key, value: item.details[key] }))
            .map(detail => (
              <Fragment key={detail.key}>
                <strong>{detail.key}</strong>: {detail.value}
                <br />
              </Fragment>
            ))}
        </p>
      </Card>
    )
  }
}

const Details = item => ({
  key: 'details',
  rows: item.details === undefined ? 0 : Object.keys(item.details).length,
  card: () => <DetailsCard item={item} />
})

export default Details
