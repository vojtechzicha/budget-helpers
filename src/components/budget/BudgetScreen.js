import React, { Component, Fragment } from 'react'
import moment from 'moment'

import Header from '../Header'
// import { formatCurrency } from '../../helpers'
const formatCurrency = value =>
  value === undefined || value === null ? 'undefined' : value.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK' })

const NormalValueCell = ({ value, onClick }) => (
  <td style={{ textAlign: 'right' }} onClick={onClick}>
    {formatCurrency(value)}
  </td>
)
const TotalValueCell = ({ value, onClick }) => (
  <td style={{ textAlign: 'right' }} onClick={onClick}>
    {<strong>{formatCurrency(value)}</strong>}
  </td>
)
const ExplainValueCell = ({ value, onClick }) => (
  <td style={{ textAlign: 'right' }} onClick={onClick}>
    {<em>{formatCurrency(value)}</em>}
  </td>
)
const RawRow = ({ budgets, heading, selector, items, result }) => (
  <tr>
    {heading}
    {budgets.map(selector).map((value, i) => <Fragment key={i}>{result(value, () => console.log(items(budgets[i])))}</Fragment>)}
  </tr>
)
const TotalRow = ({ budgets, heading, selector, items }) => (
  <RawRow
    budgets={budgets}
    items={items}
    heading={<th scope="row">{heading}</th>}
    selector={selector}
    result={(v, click) => <TotalValueCell value={v} onClick={click} />}
  />
)
const Row = ({ budgets, heading, selector, items }) => (
  <RawRow
    budgets={budgets}
    items={items}
    heading={<td>{heading}</td>}
    selector={selector}
    result={(v, click) => <NormalValueCell value={v} onClick={click} />}
  />
)
const ExplainRow = ({ budgets, heading, selector, items }) => (
  <RawRow
    budgets={budgets}
    items={items}
    heading={
      <td>
        <em>- {heading}</em>
      </td>
    }
    selector={selector}
    result={(v, click) => <ExplainValueCell value={v} onClick={click} />}
  />
)

class BudgetScreen extends Component {
  state = {
    budgets: null,
    months: null
  }

  months = (from, count) =>
    [...Array(count).keys()].map(i => i - count + 1).map(i =>
      from
        .clone()
        .add(i, 'months')
        .format('YYYYMM')
    )

  month = m => `${m.toString().substring(4, 6)}/${m.toString().substring(0, 4)}`

  async componentDidMount() {
    const { fetch } = this.props
    const months = this.months(moment().date(1), 5)

    this.setState({
      budgets: await Promise.all(months.map(m => fetch('assets', `items/budget?month=${m}`).then(res => res.json()))),
      months
    })
  }

  render() {
    const { budgets, months } = this.state

    return budgets === null ? (
      <h3>Loading</h3>
    ) : (
      <div>
        <Header />
        <table className="table table-border table-hover" style={{ marginTop: '.5em', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th scope="col">Row</th>
              {months.map(m => (
                <th scope="col" key={m} style={{ textAlign: 'right' }}>
                  {this.month(m)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <TotalRow budgets={budgets} heading="Value from Previous Month" selector={b => b.previousValue} items={b => b.previousValues} />
          </tbody>
        </table>
        <hr />
        <table className="table table-border table-hover" style={{ tableLayout: 'fixed' }}>
          <tbody>
            <Row budgets={budgets} heading="Introduction" selector={b => b.introductionCost} />
            <Row budgets={budgets} heading="Accessories" selector={b => b.accessories} />
            <Row budgets={budgets} heading="Additional Costs" selector={b => b.additionalCosts} />
            <TotalRow budgets={budgets} heading="Investment" selector={b => b.investment} />
          </tbody>
        </table>
        <hr />
        <table className="table table-border table-hover" style={{ tableLayout: 'fixed' }}>
          <tbody>
            <Row budgets={budgets} heading="Applied Damages" selector={b => -b.appliedDamages} />
            <Row budgets={budgets} heading="Write Off" selector={b => -b.writeOff} />
            <ExplainRow budgets={budgets} heading="Value" selector={b => b.writeOff - b.investmentWriteOff} />
            <ExplainRow budgets={budgets} heading="Investment" selector={b => b.investmentWriteOff} />
            <TotalRow budgets={budgets} heading="Total Value Lost" selector={b => -b.writeOff - b.appliedDamages} />
          </tbody>
        </table>
        <table className="table table-border table-hover" style={{ tableLayout: 'fixed' }}>
          <tbody>
            <Row budgets={budgets} heading="Sales Amount" selector={b => b.soldValue} />
            <Row budgets={budgets} heading="Sales Profit / Loss" selector={b => b.profit} />
            <TotalRow budgets={budgets} heading="Sold Asset Value" selector={b => -b.soldValue + b.profit} />
          </tbody>
        </table>
        <hr />
        <table className="table table-border table-hover" style={{ tableLayout: 'fixed' }}>
          <tbody>
            <TotalRow budgets={budgets} heading="Total Asset Value" selector={b => b.currentValue} items={b => b.currentValues} />
            <Row budgets={budgets} heading="Total Cash Income/Expanse" selector={b => -b.investment + b.soldValue} />
          </tbody>
        </table>
      </div>
    )
  }
}

export default BudgetScreen
