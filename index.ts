import {  assets } from './config'
import {
  announce,
  formatOrdersByDuration,
  getDualInvestments,
  getMaxAPRByDuration,
  groupAndSortByType,
  groupByDuration,
} from './utils'
const _ = require('radash')
const cron = require('node-cron')

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

  for (const text of x ) {
    await announce(text,  chatId, threadId)
  }
}

const main = async () => {
  await _.parallel(3, assets, async (ass) => {
    await suggestionInvestment(ass)
  })
};

cron.schedule('*/20 * * * * *', async () => {
  await main()
});
