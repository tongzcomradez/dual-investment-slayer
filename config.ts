const chatId = -1002282812439

export const baseURL = 'https://www.binance.com/bapi/earn/v5/friendly/pos/dc/project/list'
export const botToken = 'bot7736698354:AAHbf49XHD1EC9L7wS_R-AQ16gwCJeMjPzI'

export const aprThresholds = [
  {
    pairAsset: 'USDT/XRP',
    duration: 7,
    apr: 240,
  },
  {
    pairAsset: 'USDT/XRP',
    duration: 3,
    apr: 430,
  },
  {
    pairAsset: 'USDT/XRP',
    duration: 1,
    apr: 600,
  },
  {
    pairAsset: 'USDT/BTC',
    duration: 7,
    apr: 100,
  },
  {
    pairAsset: 'USDT/BTC',
    duration: 3,
    apr: 150,
  },
  {
    pairAsset: 'USDT/BTC',
    duration: 1,
    apr: 250,
  },
  {
    pairAsset: 'USDT/SOL',
    duration: 7,
    apr: 150,
  },
  {
    pairAsset: 'USDT/SOL',
    duration: 3,
    apr: 300,
  },

  {
    pairAsset: 'USDT/SOL',
    duration: 1,
    apr: 500,
  },
  {
    pairAsset: 'USDT/ETH',
    duration: 7,
    apr: 150,
  },
  {
    pairAsset: 'USDT/ETH',
    duration: 3,
    apr: 250,
  },
  {
    pairAsset: 'USDT/ETH',
    duration: 1,
    apr: 400,
  },
]

export const assets = [
  {
    asset: 'XRP',
    chatId,
    threadId: 1524,
    assets: [
      {
        investmentAsset : 'XRP',
        targetAsset : 'USDT',
        projectType: 'UP'
      },
      {
        investmentAsset : 'USDT',
        targetAsset : 'XRP',
        projectType: 'DOWN'
      },
    ]
  },
  {
    asset: 'BTC',
    chatId,
    threadId: 1522,
    assets: [
        {
    investmentAsset : 'BTC',
    targetAsset : 'USDT',
    projectType: 'UP'
  },

    ]
  },
  {
    asset: 'ETH',
    chatId,
    threadId: 1523,
    assets: [
        {
    investmentAsset : 'ETH',
    targetAsset : 'USDT',
    projectType: 'UP'
  },

    ]
  },
  {
    asset: 'SOL',
    chatId,
    threadId: 1526,
    assets: [
      {
        investmentAsset : 'SOL',
        targetAsset : 'USDT',
        projectType: 'UP'
      },
    ]
  },
]
