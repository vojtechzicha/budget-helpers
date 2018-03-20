import moment from 'moment'

const calculateValueWriteOff = (item, model, first) => {
  const endOfWarranty = moment(item.invoice.date).add(item.warranty, 'month')

  if (first.isAfter(endOfWarranty)) {
    return calculateValueWriteOffAfterWarranty(item, model, first)
  } else {
    return calculateValueWriteOffInWarranty(item, model, first)
  }
}

const getWarrantyCheckSettings = (item, first, warrantyChecks) => {
  let from = 1,
    to = 1,
    min = 1,
    max = 0,
    found = false

  warrantyChecks.forEach(wc => {
    if (!found) {
      from = to
      min = wc.min
      max = wc.max

      to = wc.value
      if (!first.isAfter(moment(item.invoice.date).add(wc.max * item.warranty, 'month'))) {
        found = true
      }
    }
  })

  return { from, to, min, max, easing: min === 0 ? 'out' : max === 1 ? 'in' : 'inout' }
}

const easeInQuad = (t, b, c, d) => {
  t /= d
  return c * t * t + b
}

const easeOutQuad = (t, b, c, d) => {
  t /= d
  return -c * t * (t - 2) + b
}

const easeInOutQuad = (t, b, c, d) => {
  t /= d / 2
  if (t < 1) return c / 2 * t * t + b
  t--
  return -c / 2 * (t * (t - 2) - 1) + b
}

const getActualValuePartFromEasing = (item, first, settings) => {
  const part = Math.abs(moment(first).diff(moment(item.invoice.date), 'month', true)) / item.warranty

  const t = part - settings.min,
    b = 1 - settings.from,
    c = settings.from - settings.to,
    d = settings.max - settings.min

  if (settings.easing === 'in') {
    return easeInQuad(t, b, c, d)
  } else if (settings.easing === 'out') {
    return easeOutQuad(t, b, c, d)
  } else {
    return easeInOutQuad(t, b, c, d)
  }
}

const calculateValueWriteOffInWarranty = (item, model, first) => {
  let warrantyChecks = model.warrantyChecks
  warrantyChecks.sort((a, b) => (a.min < b.min ? -1 : a.min > b.min ? 1 : 0))
  const settings = getWarrantyCheckSettings(item, first, warrantyChecks)
  const part = getActualValuePartFromEasing(item, first, settings)

  return part * item.invoice.accountingCurrencyAmount
}

const calculateValueWriteOffAfterWarranty = (item, model, first) => {
  let afterWarranties = model.afterWarranty
  let warrantyChecks = model.warrantyChecks

  warrantyChecks.sort((a, b) => (a.min < b.min ? -1 : a.min > b.min ? 1 : 0))
  afterWarranties.sort((a, b) => (a.min < b.min ? -1 : a.min > b.min ? 1 : 0))

  const monthsAfterWarranty = Math.abs(
    moment(item.invoice.date)
      .add(item.warranty, 'month')
      .diff(first)
  )

  const chosen = afterWarranties.find(aw => monthsAfterWarranty >= aw.min && monthsAfterWarranty < aw.max)

  if (chosen === undefined) {
    return item.invoice.accountingCurrencyAmount * afterWarranties[afterWarranties.length - 1].value
  } else {
    let from = warrantyChecks[warrantyChecks.length - 1].value,
      found = false

    afterWarranties.forEach(aw => {
      if (!found) {
        if (aw.value === chosen.value) {
          found = true
        } else {
          from = aw.value
        }
      }
    })

    const t = monthsAfterWarranty - chosen.min,
      b = 1 - from,
      c = from - chosen.value,
      d = chosen.max - chosen.min

    return easeInOutQuad(t, b, c, d) * item.invoice.accountingCurrencyAmount
  }
}

const calculateAdditionalCosts = (item, last) => {
  return (item.additionalCosts || [])
    .map(ac => ({ value: ac.accountingCurrencyAmount, date: moment(ac.invoiceDate) }))
    .filter(ac => ac.date.isBefore(last))
    .reduce((pr, cu) => pr + cu.value, 0)
}

const calculateAccessories = (item, last) => {
  console.log(last)
  return (item.accessories || [])
    .map(ac => ({ value: ac.accountingCurrencyAmount, date: moment(ac.invoiceDate) }))
    .filter(ac => ac.date.isBefore(last))
    .reduce(
      (pr, cu) => ({
        accessories: pr.accessories + cu.value,
        accessorryWriteOff: pr.accessorryWriteOff + cu.value * 0.2
      }),
      {
        accessories: 0,
        accessorryWriteOff: 0
      }
    )
}

export const calculateItemAbsolute = (item, model, month) => {
  const first = moment(`${month.substring(0, 4)}-${month.substring(5, 7)}-01`, 'YYYY-MM-DD'),
    last = first
      .clone()
      .add(1, 'month')
      .add(-1, 'day')

  const initialInvestment = item.invoice.accountingCurrencyAmount,
    initialValue = initialInvestment

  const valueWriteOff = calculateValueWriteOff(item, model, first)

  const additionalCosts = calculateAdditionalCosts(item, last)
  const { accessories, accessorryWriteOff } = calculateAccessories(item, last)

  const investment = initialInvestment + additionalCosts + accessories

  const investmentWriteOff = accessorryWriteOff,
    writeOff = valueWriteOff + investmentWriteOff

  const currentValue = investment - writeOff

  return {
    initialValue,
    appliedDamages: 0,
    additionalCosts,
    accessories,
    investment,
    investmentWriteOff,
    writeOff: writeOff,
    currentValue: currentValue,
    soldValue: null
    // profit
  }
}
