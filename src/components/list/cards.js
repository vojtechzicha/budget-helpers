import React, { Fragment } from 'react'
import moment from 'moment'

import { formatCurrency } from './../../helpers'

const Card = ({ title, subtitle = null, border = null, children }) => (
  <div className={`card ${border !== null && `border-${border}`}`}>
    <div className="card-body">
      <h5 className="card-title">{title}</h5>
      {subtitle !== null && <h6 className="card-subtitle mb-2 text-muted">{subtitle}</h6>}
      {children}
    </div>
  </div>
)

export const Details = item => ({
  key: 'details',
  rows: item.details === undefined ? 0 : Object.keys(item.details).length,
  card: () => (
    <Card title="Details">
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
})

export const SerialKey = item => ({
  key: 'serial-key',
  rows: item.serialKey !== undefined && item.serialKey !== null ? 1 : 0,
  card: () => <Card title="Serial Key" subtitle={item.serialKey} />
})

export const Invoice = item => ({
  key: 'invoice',
  rows: 3,
  card: () => (
    <Card title="Invoice">
      <p className="card-text">
        <strong>Date</strong>: {moment(item.invoice.date).format('MMMM Do, YYYY')}
        <br />
        <strong>Amount</strong>: {formatCurrency(item.invoice.accountingCurrencyAmount)}
        <br />
        <strong>Original Amount</strong>: {formatCurrency(item.invoice.originalCurrencyAmount, ` ${item.invoice.originalCurrency}`)}
      </p>
    </Card>
  )
})
export const Sell = item => ({
  key: 'sell',
  rows: item.sell !== undefined ? 3 : 0,
  card: () => (
    <Card title="Sold">
      <p className="card-text">
        <strong>Date</strong>: {moment(item.sell.date).format('MMMM Do, YYYY')}
        <br />
        <strong>Amount</strong>: {formatCurrency(item.sell.accountingCurrencyAmount)}
        <br />
        <strong>Original Amount</strong>: {formatCurrency(item.sell.originalCurrencyAmount, ` ${item.sell.originalCurrency}`)}
      </p>
    </Card>
  )
})

export const ExpiredWarranty = item => ({
  key: 'expired-warranty',
  rows: moment().isAfter(moment(item.invoice.date).add(item.warranty, 'months')) ? 3 : 0,
  card: () => (
    <Card
      title="Warranty"
      subtitle={`Expired ${moment(item.invoice.date)
        .add(item.warranty, 'months')
        .fromNow()}`}
      border="danger">
      <p className="card-text">
        <strong>Warranty Period</strong>: {item.warranty} months<br />
        <strong>Warranty Expired</strong>:{' '}
        {moment(item.invoice.date)
          .add(item.warranty, 'months')
          .format('MMMM Do, YYYY')}
      </p>
    </Card>
  )
})

export const ValidWarranty = item => ({
  key: 'valid-warranty',
  rows: moment().isAfter(moment(item.invoice.date).add(item.warranty, 'months')) ? 0 : 3,
  card: () => (
    <Card
      title="Warranty"
      subtitle={`Valid, expires ${moment(item.invoice.date)
        .add(item.warranty, 'months')
        .fromNow()}`}
      border={
        moment()
          .add(Math.floor(item.warranty / 3), 'months')
          .isAfter(moment(item.invoice.date).add(item.warranty, 'months'))
          ? 'warning'
          : 'success'
      }>
      <p className="card-text">
        <strong>Warranty Period</strong>: {item.warranty} months<br />
        <strong>Warranty Expires</strong>:{' '}
        {moment(item.invoice.date)
          .add(item.warranty, 'months')
          .format('MMMM Do, YYYY')}
      </p>
    </Card>
  )
})

export const Documents = item => ({
  key: 'documents',
  rows: item.documents === undefined ? 0 : item.documents.length,
  predicate: () => item.documents.length > 0,
  card: () => (
    <Card title="Documents">
      <p className="card-text">
        {item.documents.map(doc => (
          <Fragment key={doc.file}>
            <strong>{doc.type}</strong>:{' '}
            <a href={`${process.env.REACT_APP_SERVER_URI}?file=${encodeURIComponent(doc.file)}`} target="_blank">
              view
            </a>
            <br />
          </Fragment>
        ))}
      </p>
    </Card>
  )
})

export const Identifiers = item => ({
  key: 'ids',
  rows: item.ids === undefined ? 0 : item.ids.length,
  card: () => (
    <Card title="Identifiers">
      <p className="card-text">
        {item.ids.map(id => (
          <Fragment key={id.type + '-' + id.value}>
            <strong>{id.type}</strong>: {id.value}
            <br />
          </Fragment>
        ))}
      </p>
    </Card>
  )
})

export const WriteOff = item => ({
  key: 'write-off',
  rows: (res => (res === null ? 0 : 7))(item.calculation.absolute),
  card: () => {
    const res = item.calculation.absolute
    return (
      <Card title="Value">
        <p className="card-text">
          <strong>Initial Value</strong>: {formatCurrency(res.initialValue)}
          <br />
          {res.appliedDamages > 0 && (
            <Fragment>
              <strong>Applied Damages</strong>:{' '}
              <span title={`${formatCurrency(res.appliedDamages / res.initialValue * 100, '')} %`}>
                {formatCurrency(-res.appliedDamages)}
              </span>
              <br />
            </Fragment>
          )}
          {res.additionalCosts > 0 && (
            <Fragment>
              <strong>Additional Costs</strong>: {formatCurrency(res.additionalCosts)}
              <br />
            </Fragment>
          )}
          {res.accessories > 0 && (
            <Fragment>
              <strong>Accessories</strong>: {formatCurrency(res.accessories)}
              <br />
            </Fragment>
          )}
          {res.writeOff > 0 && (
            <Fragment>
              <strong>Write-Off</strong>:{' '}
              <span title={`${formatCurrency(res.writeOff / res.initialValue * 100, '')} %`}>{formatCurrency(-res.writeOff)}</span>
            </Fragment>
          )}
        </p>
        <hr />
        <p className="card-text">
          {res.soldValue === null ? (
            <Fragment>
              <strong>Current Value</strong>:{' '}
              <span title={`${formatCurrency(res.currentValue / res.initialValue * 100, '')} %`}>{formatCurrency(res.currentValue)}</span>
            </Fragment>
          ) : (
            <Fragment>
              <strong>Last Value</strong>:{' '}
              <span title={`${formatCurrency((res.soldValue - res.profit) / res.initialValue * 100, '')} %`}>
                {formatCurrency(res.soldValue - res.profit)}
              </span>
              <br />
              <strong>Sold for</strong>:{' '}
              <span title={`${formatCurrency(res.soldValue / res.investment * 100, '')} %`}>{formatCurrency(res.soldValue)}</span>
              <br />
              <strong>Profit/Loss</strong>: {formatCurrency(res.profit)}
              <br />
            </Fragment>
          )}
        </p>
      </Card>
    )
  }
})

export const Damages = item => ({
  key: 'damages',
  rows: item.damages === undefined ? 0 : item.damages.length * 4,
  card: () => {
    const res = item.calculation.absolute
    return (
      <Card title="Damages" border={item.damages.filter(d => d.repairedDate === undefined).length > 0 ? 'danger' : 'warning'}>
        <p className="card-text">
          {item.damages.map((damage, i) => (
            <Fragment key={i}>
              <strong>
                <u>{damage.title === undefined ? damage.kind : damage.title}</u>
              </strong>
              <br />
              {damage.title !== undefined && (
                <Fragment>
                  <em>{damage.kind}</em>
                  <br />
                </Fragment>
              )}
              <strong>Since</strong>: <span title={moment(damage.date).format('MMMM Do, YYYY')}>{moment(damage.date).fromNow()}</span>
              <br />
              {res.damages[i] > 0 && (
                <Fragment>
                  <strong>Value lost</strong>: <em>{formatCurrency(res.damages[i])}</em>
                  <br />
                </Fragment>
              )}
              {damage.repairedDate !== undefined && (
                <Fragment>
                  <strong>Repaired</strong>:{' '}
                  <span title={moment(damage.repairedDate).format('MMMM Do, YYYY')}>{moment(damage.repairedDate).fromNow()}</span>
                </Fragment>
              )}
            </Fragment>
          ))}
        </p>
      </Card>
    )
  }
})

export const Month = item => ({
  key: 'month',
  rows: (res => (res === null || res.lastMonthValue === res.currentValue ? 0 : 7))(item.calculation.relative),
  card: () => {
    const res = item.calculation.relative
    return (
      <Card title="Value Changes This Month">
        <p className="card-text">
          <strong>
            {moment()
              .add(-1, 'month')
              .format('MMMM YYYY')}
          </strong>: {formatCurrency(res.lastMonthValue)}
          <br />
          {res.introductionCost > 0 && (
            <Fragment>
              <strong>Introduction Cost</strong>: <span>{formatCurrency(res.introductionCost)}</span>
              <br />
            </Fragment>
          )}
          {res.appliedDamages > 0 && (
            <Fragment>
              <strong>Applied Damages</strong>:{' '}
              <span title={`${formatCurrency(res.appliedDamages / res.initialValue * 100, '')} %`}>
                {formatCurrency(-res.appliedDamages)}
              </span>
              <br />
            </Fragment>
          )}
          {res.additionalCosts > 0 && (
            <Fragment>
              <strong>Additional Costs</strong>: {formatCurrency(res.additionalCosts)}
              <br />
            </Fragment>
          )}
          {res.accessories > 0 && (
            <Fragment>
              <strong>Accessories</strong>: {formatCurrency(res.accessories)}
              <br />
            </Fragment>
          )}
          {res.writeOff > 0 && (
            <Fragment>
              <strong>Write-Off</strong>:{' '}
              <span title={`${formatCurrency(res.writeOff / res.initialValue * 100, '')} %`}>{formatCurrency(-res.writeOff)}</span>
            </Fragment>
          )}
        </p>
        <hr />
        <p className="card-text">
          {res.soldValue === null && (
            <Fragment>
              <strong>Current Value</strong>:{' '}
              <span title={`${formatCurrency(res.currentValue / res.initialValue * 100, '')} %`}>{formatCurrency(res.currentValue)}</span>
              <br />
            </Fragment>
          )}
          {res.soldValue !== null && (
            <Fragment>
              <strong>Sold for</strong>:{' '}
              <span title={`${formatCurrency(res.soldValue / res.investment * 100, '')} %`}>{formatCurrency(res.soldValue)}</span>
              <br />
            </Fragment>
          )}
          {res.profit !== null && (
            <Fragment>
              <strong>Profit/Loss</strong>: {formatCurrency(res.profit)}
              <br />
            </Fragment>
          )}
        </p>
      </Card>
    )
  }
})

export const Accessories = item => ({
  key: 'accessories',
  rows: item.accessories !== undefined ? item.accessories.length * 4 : 0,
  card: () => (
    <Card title="Accessories">
      {item.accessories.map((acc, i) => (
        <p className="card-text" key={i}>
          <strong>
            <u>{acc.type}</u>
          </strong>
          <br />
          {acc.name}
          <br />
          <strong>Value</strong>: {formatCurrency(acc.accountingCurrencyAmount)}
          <br />
          <strong>Since</strong>: {moment(acc.invoiceDate).format('MMMM Do, YYYY')}
        </p>
      ))}
    </Card>
  )
})

export const AdditionalCosts = item => ({
  key: 'additionalCosts',
  rows: item.additionalCosts !== undefined ? item.additionalCosts.length * 3 : 0,
  card: () => (
    <Card title="Additional Costs">
      <p className="card-text">
        {item.additionalCosts.map((ac, i) => (
          <Fragment key={i}>
            <u>{ac.description}</u>
            <br />
            <strong>Value</strong>: {formatCurrency(ac.accountingCurrencyAmount)}
            <br />
            <strong>Since</strong>: {moment(ac.invoiceDate).format('MMMM Do, YYYY')}
          </Fragment>
        ))}
      </p>
    </Card>
  )
})