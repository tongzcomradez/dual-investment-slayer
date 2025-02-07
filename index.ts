const _ = require('radash')
const axios = require('axios');
const qs = require('node:querystring');
const cron = require('node-cron')
const chatId = -1002282812439
const aprThresholds = [
  {
    pairAsset: 'USDT/XRP',
    duration: 7,
    apr: 200,
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

const baseURL = 'https://www.binance.com/bapi/earn/v5/friendly/pos/dc/project/list'
const botToken = 'bot7736698354:AAHbf49XHD1EC9L7wS_R-AQ16gwCJeMjPzI'

export const sellHighAssets = [
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

export const buyLowAssets = [
  {
    investmentAsset : 'USDT',
    targetAsset : 'BTC',
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

export const assets = [
  ...sellHighAssets,
  ...buyLowAssets,
]

export const filterOnlySuggestion = (dualInvestments) => {
  return _.chain(
    (is) => is.filter(i => i.canPurchase),
    (is) => is.map(i => {
      const type = i.type === 'UP'? 'Sell High' : 'Buy Low'
      const pairAsset = i.type === 'UP' ? `${i.targetAsset}/${i.investmentAsset}`: `${i.investmentAsset}/${i.targetAsset}`
      return {
        type,
        pairAsset,
        asset: `${i.investmentAsset}/${i.targetAsset}`,
        targetPrice: (+i.strikePrice).toFixed(2),
        apr: parseFloat((+i.apr  * 100).toFixed(2)),
        duration: +i.duration,
        settlementDate: new Date(+i.settleTime)
      }
    }),
    (is) => is.filter(i => {
      const aprThreshold = aprThresholds.find((t) => i.duration >= t.duration && i.pairAsset === t.pairAsset)
      return i.apr >= aprThreshold?.apr
    })
  )(dualInvestments)
}

export const getDualInvestments = async (asset) => {
  const query = qs.stringify({
    investmentAsset:asset.investmentAsset,
    targetAsset: asset.targetAsset,
    projectType: asset.projectType,
    sortType: 'APY_DESC',
    endDuration: 7
  })

  const url = `${baseURL}?${query}`

  const response = await axios.get(url);
  return filterOnlySuggestion(response?.data?.data?.list || [])

  return (response?.data?.data?.list || [])
    .filter((i) => {
      const aprThreshold = aprThresholds.find((t) => i.duration >= t.duration && i.pairAsset === t.pairAsset)
      return i.apr >= aprThreshold?.apr
    })
};

const announce = async (text, chat_id) => {
  const url = `https://api.telegram.org/${botToken}/sendMessage`
  const response = await axios.post(url, {
    chat_id,
    text
  })
};

const getMaxAPRByDuration = (orders) => {
  const aprByDuration = {};

  orders.forEach(order => {
    const { duration, apr, } = order;

    // เช็คว่า duration นี้มีข้อมูลหรือไม่ หากไม่มีให้สร้าง
    if (!aprByDuration[duration] || aprByDuration[duration].apr < apr) {
      aprByDuration[duration] = order;
    }
  });

  return aprByDuration;
};

const groupByDuration = (orders) => {
  const grouped = {};

  orders.forEach(order => {
    // Loop ผ่าน duration ที่มีในแต่ละกลุ่ม
    for (const duration in order) {
      const orderData = order[duration];
      if (!grouped[duration]) {
        grouped[duration] = []; // สร้างกลุ่ม duration ถ้ายังไม่มี
      }

      // เพิ่มข้อมูลใน array ของแต่ละ duration
      grouped[duration].push(orderData);
    }
  });

  return grouped;
};

const groupAndSortByType = (orders) => {
  const grouped = {};

  // Loop ผ่านแต่ละ duration
  for (const duration in orders) {
    // สร้างกลุ่มใหม่ใน grouped ตาม duration
    const orderList = orders[duration];

    // แบ่งข้อมูลออกตาม type และเรียง APR จากมากไปน้อย
    const buyLowOrders = orderList.filter(order => order.type === 'Buy Low').sort((a, b) => b.apr - a.apr);
    const sellHighOrders = orderList.filter(order => order.type === 'Sell High').sort((a, b) => b.apr - a.apr);

    // บันทึกลงใน grouped โดยแบ่งตาม type (Buy Low และ Sell High)
    grouped[duration] = {
      'Buy Low': buyLowOrders,
      'Sell High': sellHighOrders
    };
  }

  return grouped;
};

const formatOrdersByDuration = (groupedOrders) => {
  let result = [];

  // จัดเรียง duration จาก 6Days ไป 2Days
  const sortedDurations = Object.keys(groupedOrders).sort((a, b) => b.localeCompare(a));

  // สำหรับแต่ละ duration
  sortedDurations.forEach((duration) => {
    let formattedResult = `📅${duration}-Day APR Update\n\n`;

    // จัดกลุ่มข้อมูลประเภท Buy Low
    if (groupedOrders[duration]['Buy Low'] && groupedOrders[duration]['Buy Low'].length > 0) {
      formattedResult += '🟢 Buy Low\n';
      groupedOrders[duration]['Buy Low']
        .sort((a, b) => b.apr - a.apr) // เรียงข้อมูลตาม APR สูงสุด
        .forEach(order => {
          const asset = order.asset.split('/')[1];  // ได้ผลลัพธ์เช่น BTC หรือ XRP
          formattedResult += `  • ${asset} ${order.apr}% | ${order.targetPrice}\n`;
        });
      formattedResult += '\n';  // เพิ่มบรรทัดว่างหลังจากจบ Buy Low
    }

    // จัดกลุ่มข้อมูลประเภท Sell High
    if (groupedOrders[duration]['Sell High'] && groupedOrders[duration]['Sell High'].length > 0) {
      formattedResult += '🔴 Sell High\n';
      groupedOrders[duration]['Sell High']
        .sort((a, b) => b.apr - a.apr) // เรียงข้อมูลตาม APR สูงสุด
        .forEach(order => {
          const asset = order.asset.split('/')[0];  // ได้ผลลัพธ์เช่น BTC หรือ XRP
          formattedResult += `  • ${asset} ${order.apr}% | ${order.targetPrice}\n`;
        });
    }

    result.push(formattedResult);  // เก็บผลลัพธ์ใน array
  });

  return result;
};

cron.schedule('*/10 * * * * *', () => {
  (async () => {
    try {
      console.log(`processing`)
      const suggestionInvestment = (await _.parallel(3, assets, async (asset) => {
        const data = await getDualInvestments(asset)
        if (!data.length) {
          return
        }

        return  getMaxAPRByDuration(data)
      }))
        .filter(i => !!i)

      const x = formatOrdersByDuration(_.chain(groupByDuration, groupAndSortByType)(suggestionInvestment))

      for (const text of x ) {
        await announce(text,  chatId)
      }
      console.log(`processed`)
    } catch (error) {
      console.log('processing error', error)
      await announce('มี Error เข้ามาดูหน่อย', chatId)
    }
  })();
});

cron.schedule('0 * * * *', async () => {
  // await announce('บอทยังทำงานอยู่ ไม่ได้หนีจากไปไหน',  chatId)
})