import { filterOnlySuggestion } from '../index'

const xrp = [
  {
  id: "1745215",
    investmentAsset: "USDT",
  targetAsset: "XRP",
  underlying: "XRP",
  strikePrice: "2.44000000",
  duration: "7",
  settleTime: "1739520000000",
  canPurchase: true,
  apr: "0.40670000",
  orderId: "24764628549",
  minDepositAmount: "0.10000000",
  maxDepositAmount: "27000.00000000",
  type: "DOWN",
  autoCompoundPlanList: [ "STANDARD", "ADVANCE" ],
},
  {
  id: "1742350",
    investmentAsset: "USDT",
    targetAsset: "XRP",
    underlying: "XRP",
    strikePrice: "2.39000000",
    duration: "7",
    settleTime: "1739520000000",
    canPurchase: true,
    apr: "0.39210000",
    orderId: "24764631155",
    minDepositAmount: "0.10000000",
    maxDepositAmount: "1002498.00000000",
    type: "DOWN",
    autoCompoundPlanList: [ "STANDARD", "ADVANCE" ],
}, {
  id: "1741945",
    investmentAsset: "USDT",
    targetAsset: "XRP",
    underlying: "XRP",
    strikePrice: "2.38000000",
    duration: "7",
    settleTime: "1739520000000",
    canPurchase: true,
    apr: "0.38970000",
    orderId: "24764188634",
    minDepositAmount: "0.10000000",
    maxDepositAmount: "5000000.00000000",
    type: "DOWN",
    autoCompoundPlanList: [ "STANDARD", "ADVANCE" ],
}, {
  id: "1745160",
    investmentAsset: "USDT",
    targetAsset: "XRP",
    underlying: "XRP",
    strikePrice: "2.37000000",
    duration: "7",
    settleTime: "1739520000000",
    canPurchase: true,
    apr: "0.34270000",
    orderId: "24764188579",
    minDepositAmount: "0.10000000",
    maxDepositAmount: "5000000.00000000",
    type: "DOWN",
    autoCompoundPlanList: [ "STANDARD", "ADVANCE" ],
}, {
  id: "1742323",
    investmentAsset: "USDT",
    targetAsset: "XRP",
    underlying: "XRP",
    strikePrice: "2.36000000",
    duration: "7",
    settleTime: "1739520000000",
    canPurchase: true,
    apr: "0.32470000",
    orderId: "24764631386",
    minDepositAmount: "0.10000000",
    maxDepositAmount: "1002498.00000000",
    type: "DOWN",
    autoCompoundPlanList: [ "STANDARD", "ADVANCE" ],
}, {
  id: "1742349",
    investmentAsset: "USDT",
    targetAsset: "XRP",
    underlying: "XRP",
    strikePrice: "2.34000000",
    duration: "7",
    settleTime: "1739520000000",
    canPurchase: true,
    apr: "0.23800000",
    orderId: "24764188735",
    minDepositAmount: "0.10000000",
    maxDepositAmount: "5000000.00000000",
    type: "DOWN",
    autoCompoundPlanList: [ "STANDARD", "ADVANCE" ],
}, {
  id: "1742171",
    investmentAsset: "USDT",
    targetAsset: "XRP",
    underlying: "XRP",
    strikePrice: "2.35000000",
    duration: "7",
    settleTime: "1739520000000",
    canPurchase: true,
    apr: "0.23280000",
    orderId: "24763325015",
    minDepositAmount: "0.10000000",
    maxDepositAmount: "5000000.00000000",
    type: "DOWN",
    autoCompoundPlanList: [ "STANDARD", "ADVANCE" ],
}, {
  id: "1741909",
    investmentAsset: "USDT",
    targetAsset: "XRP",
    underlying: "XRP",
    strikePrice: "2.33000000",
    duration: "7",
    settleTime: "1739520000000",
    canPurchase: true,
    apr: "0.20110000",
    orderId: "24763281144",
    minDepositAmount: "0.10000000",
    maxDepositAmount: "5000000.00000000",
    type: "DOWN",
    autoCompoundPlanList: [ "STANDARD", "ADVANCE" ],
}, {
  id: "1745137",
    investmentAsset: "USDT",
    targetAsset: "XRP",
    underlying: "XRP",
    strikePrice: "2.32000000",
    duration: "7",
    settleTime: "1739520000000",
    canPurchase: true,
    apr: "0.18500000",
    orderId: "24763270952",
    minDepositAmount: "0.10000000",
    maxDepositAmount: "5000000.00000000",
    type: "DOWN",
    autoCompoundPlanList: [ "STANDARD", "ADVANCE" ],
}, {
  id: "1742110",
    investmentAsset: "USDT",
    targetAsset: "XRP",
    underlying: "XRP",
    strikePrice: "2.31000000",
    duration: "7",
    settleTime: "1739520000000",
    canPurchase: true,
    apr: "0.15370000",
    orderId: "24763283421",
    minDepositAmount: "0.10000000",
    maxDepositAmount: "5000000.00000000",
    type: "DOWN",
    autoCompoundPlanList: [ "STANDARD", "ADVANCE" ],
}
]
describe('Test', () => {
  it('it should return', () => {
    const fitlerd = filterOnlySuggestion(xrp)
    console.log(fitlerd)
    expect(true).toBe(true)
  })
})