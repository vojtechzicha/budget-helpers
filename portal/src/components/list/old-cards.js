import React, { Fragment } from 'react'
import moment from 'moment'

// import { formatCurrency } from './../../helpers'
import Card from './cards/Card'
const formatCurrency = curr => (c => c.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK' }))(curr || 0)

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
  rows: (res => (res === null ? 0 : res.previousValue === res.currentValue ? 0 : 7))(item.calculation.relative),
  card: () => {
    const res = item.calculation.relative
    return (
      <Card title="Value Changes This Month">
        <p className="card-text">
          <strong>
            {moment()
              .add(-1, 'month')
              .format('MMMM YYYY')}
          </strong>: {formatCurrency(res.previousValue)}
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
