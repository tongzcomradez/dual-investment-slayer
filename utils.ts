import * as _ from 'radash'
import { aprThresholds, baseURL, botToken } from './config'
import * as qs from 'querystring'
import axios from 'axios'
export const filterOnlySuggestion = (dualInvestments: any) => {
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
};

export const announce = async (text: string, chat_id: number, message_thread_id: number ) => {
  const url = `https://api.telegram.org/${botToken}/sendMessage`
  const response = await axios.post(url, {
    chat_id,
    message_thread_id,
    text
  })
};

export const getMaxAPRByDuration = (orders) => {
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

export const groupByDuration = (orders) => {
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

export const groupAndSortByType = (orders) => {
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

export const formatOrdersByDuration = (groupedOrders) => {
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
