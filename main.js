const _ = require('radash')
const axios = require('axios');
const qs = require('node:querystring');

const aprThresholds = [
  {
    duration: 7,
    apr: 50,
  },
  {
    duration: 3,
    apr: 300,
  },
  {
    duration: 1,
    apr: 400,
  }
]

const baseURL = 'https://www.binance.com/bapi/earn/v5/friendly/pos/dc/project/list'

const sellHighAssets = [
  {
    investmentAsset : 'BTC',
    targetAsset : 'USDT',
    projectType: 'UP'
  },
  {
    investmentAsset : 'ETH',
    targetAsset : 'USDT',
    projectType: 'UP'
  },
  {
    investmentAsset : 'BNB',
    targetAsset : 'USDT',
    projectType: 'UP'
  },
  {
    investmentAsset : 'SOL',
    targetAsset : 'USDT',
    projectType: 'UP'
  },
  {
    investmentAsset : 'XRP',
    targetAsset : 'USDT',
    projectType: 'UP'
  }
]

const buyLowAssets = [
  {
    investmentAsset : 'USDT',
    targetAsset : 'BTC',
    projectType: 'DOWN'
  },
  {
    investmentAsset : 'USDT',
    targetAsset : 'BNB',
    projectType: 'DOWN'
  },
  {
    investmentAsset : 'USDT',
    targetAsset : 'XRP',
    projectType: 'DOWN'
  },
  {
    investmentAsset : 'USDT',
    targetAsset : 'SOL',
    projectType: 'DOWN'
  },
  {
    investmentAsset : 'USDT',
    targetAsset : 'ETH',
    projectType: 'DOWN'
  }
]

const assets = [
  ...sellHighAssets,
  ...buyLowAssets,
]

const getDualInvestments = async (asset) => {
  const query = qs.stringify({
    investmentAsset:asset.investmentAsset,
    targetAsset: asset.targetAsset,
    projectType: asset.projectType,
    sortType: 'APY_DESC',
    endDuration: 7
  })

  const url = `${baseURL}?${query}`

  const response = await axios.get(url);
  return (response?.data?.data?.list || [])
    .filter((i) => i.canPurchase)
    .map((invest) => {
      const type = invest.type === 'UP'? 'Sell High' : 'Buy Low'
      const asset = type === 'Sell High' ? `Sell ${invest.investmentAsset} for ${invest.targetAsset}` : `Buy ${invest.targetAsset} with ${invest.investmentAsset}`
      return {
        type,
        asset,
        targetPrice: invest.strikePrice,
        apr: invest.apr  * 100,
        duration: +invest.duration,
        settlementDate: new Date(+invest.settleTime)
      }
    })
    .filter((i) => {
      const aprThreshold = aprThresholds.find((t) => i.duration >= t.duration)
      return i.apr >= aprThreshold.apr
    })
};

(async () => {
  const suggestionInvestment = (await _.parallel(3, assets, async (asset) => {
    const data = await getDualInvestments(asset)
    if (!data.length) {
      return
    }

    return data.map((asset) => {
      return {
        ...asset,
        text: `${asset.asset} - ${asset.apr.toFixed(2)}% APR - ${asset.duration}days - ${asset.settlementDate.toTimeString()}`,
      }
    })
  }))
    .filter(i => !!i)
    .flat()

  console.log(suggestionInvestment, 'suggestionInvestment')
  // todo send message to telegram
})();