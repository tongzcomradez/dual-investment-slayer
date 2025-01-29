const _ = require('radash')
const axios = require('axios');
const qs = require('node:querystring');
const { chain } = require('radash')
const cron = require('node-cron')

const aprThresholds = [
  {
    duration: 7,
    apr: 50,
    apr: 270,
  },
  {
    duration: 3,
    apr: 50,
    apr: 450,
  },
  {
    duration: 1,
    apr: 50,
    apr: 650,
  }
]

const baseURL = 'https://www.binance.com/bapi/earn/v5/friendly/pos/dc/project/list'
const botToken = 'bot7736698354:AAHbf49XHD1EC9L7wS_R-AQ16gwCJeMjPzI'

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
      return {
        type,
        asset: `${invest.investmentAsset}/${invest.targetAsset}`,
        targetPrice: (+invest.strikePrice).toFixed(2),
        apr: (invest.apr  * 100).toFixed(2),
        duration: +invest.duration,
        settlementDate: new Date(+invest.settleTime)
      }
    })
    .filter((i) => {
      const aprThreshold = aprThresholds.find((t) => i.duration >= t.duration)
      return i.apr >= aprThreshold.apr
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

cron.schedule('*/30 * * * * *', () => {
  (async () => {
    console.log(`processing`)
    const suggestionInvestment = (await _.parallel(3, assets, async (asset) => {
      const data = await getDualInvestments(asset)
      if (!data.length) {
        return
      }

      return  getMaxAPRByDuration(data)
    }))
      .filter(i => !!i)

    const x = formatOrdersByDuration(chain(groupByDuration, groupAndSortByType)(suggestionInvestment))

    for (const text of x ) {
      await announce(text,  -1002282812439)
    }
    console.log(`processed`)
  })();
});

