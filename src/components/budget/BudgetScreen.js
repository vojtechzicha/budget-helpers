import React, { Component, Fragment } from 'react'
import moment from 'moment'

import Header from '../Header'
// import { formatCurrency } from '../../helpers'

const NormalValueCell = ({ value }) => <td style={{ textAlign: 'right' }}>{value}</td>
const TotalValueCell = ({ value }) => <td style={{ textAlign: 'right' }}>{/* <strong>{formatCurrency(value)}</strong> */}</td>
const ExplainValueCell = ({ value }) => <td style={{ textAlign: 'right' }}>{/* <em>{formatCurrency(value)}</em> */}</td>
const RawRow = ({ budgets, heading, selector, result }) => (
  <tr>
    {heading}
    {budgets.map(selector).map((value, i) => <Fragment key={i}>{result(value)}</Fragment>)}
  </tr>
)
const TotalRow = ({ budgets, heading, selector }) => (
  <RawRow budgets={budgets} heading={<th scope="row">{heading}</th>} selector={selector} result={v => <TotalValueCell value={v} />} />
)
const Row = ({ budgets, heading, selector }) => (
  <RawRow budgets={budgets} heading={<td>{heading}</td>} selector={selector} result={v => <NormalValueCell value={v} />} />
)
const ExplainRow = ({ budgets, heading, selector }) => (
  <RawRow
    budgets={budgets}
    heading={
      <td>
        <em>- {heading}</em>
      </td>
    }
    selector={selector}
    result={v => <ExplainValueCell value={v} />}
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
    const months = this.months(moment().date(1), 5)

    this.setState({
      budgets: await Promise.all(
        months.map(m => fetch(`${process.env.REACT_APP_SERVER_URI}assets/items/budget?month=${m}`).then(res => res.json()))
      ),
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
            <TotalRow budgets={budgets} heading="Value from Previous Month" selector={b => b.lastMonthValue} />
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
            <TotalRow budgets={budgets} heading="Total Asset Value" selector={b => b.currentValue} />
            <Row budgets={budgets} heading="Total Cash Income/Expanse" selector={b => -b.investment + b.soldValue} />
          </tbody>
        </table>
      </div>
    )
  }
}

export default BudgetScreen
