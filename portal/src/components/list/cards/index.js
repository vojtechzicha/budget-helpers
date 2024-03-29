import Details from './Details'
import Identifiers from './Identifiers'
import SerialKey from './SerialKey'
import Documents from './Documents'
import Sell from './Sell'
import Accessories from './Accessories'
import AdditionalCosts from './AdditionalCosts'
import Invoice from './Invoice'

import { ExpiredWarranty, ValidWarranty } from './Warranty'

import { WriteOff, Month } from './../old-cards'

const cards = [
  Details,
  SerialKey,
  Invoice,
  ExpiredWarranty,
  ValidWarranty,
  Identifiers,
  Documents,
  Sell,
  Accessories,
  AdditionalCosts,
  WriteOff,
  Month
]

export default cards
