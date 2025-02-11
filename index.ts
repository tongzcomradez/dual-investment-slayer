import {  assets } from './config'
import {
  announce,
  formatOrdersByDuration,
  getDualInvestments,
  getMaxAPRByDuration,
  groupAndSortByType,
  groupByDuration,
} from './utils'
import { MongoClient } from 'mongodb'
const _ = require('radash')
const cron = require('node-cron')

const uri = process.env.MONGO_URI; // เปลี่ยนเป็น URI ของคุณ
const client = new MongoClient(uri);

const suggestionInvestment = async (command: { chatId: number, threadId?: number, assets: any[] }) => {
  const { assets, chatId, threadId } = command
  const suggestionInvestment = (await _.parallel(3, assets, async (asset) => {
    const data = await getDualInvestments(asset)
    if (!data.length) {
      return
    }

    return  getMaxAPRByDuration(data)
  }))
    .filter(i => !!i)

  const x = formatOrdersByDuration(_.chain(groupByDuration, groupAndSortByType)(suggestionInvestment))

  // await updateMaxApr(suggestionInvestment)
  for (const text of x ) {
    await announce(text,  chatId, threadId)
  }
}

const updateMaxApr = async (suggestionInvestment: any[]) => {
  const flatted = suggestionInvestment.map((item) => Object.values(item)).flat(1) as any[]

  const bulkWrite = flatted.map(f => ({
    updateOne: {
      filter: {
        pairAsset: f.pairAsset,
        type: f.type,
        duration: f.duration
      },
      update: {
        $max: {
          apr: f.apr
        }
      },
      upsert: true
    }
  }))

  if (bulkWrite.length === 0) return

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB");
    await client.db("bn-dual-investments").collection("apr").bulkWrite(bulkWrite)
  }
  catch(err) {
    console.error("❌ Error:", err);
  } finally {
    await client.close()
  }
}

const main = async () => {
  await _.parallel(3, assets, async (ass) => {
    await suggestionInvestment(ass)
  })
};

cron.schedule('*/7 * * * * *', async () => {
  try {
    await main()
  } catch (error) {
    console.log('error', error)
  }
});

