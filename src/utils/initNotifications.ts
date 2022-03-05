import addMinutes from "date-fns/addMinutes"
import format from "date-fns/format"
import { TextBasedChannel } from "discord.js"
import schedule from "node-schedule"

import { getClient } from "./getClient"
import { BOT } from "./getDiscordClient"

export async function initNotifications() {
  const client = getClient()

  // get the db records
  const resins = await client.resins.findMany({
    where: {
      shouldNotify: true,
    }
  })
  const DEFAULT_TIME_OFFFSET_MINUTES = 5

  // loop through the records and schedule a job for each
  resins.forEach(resin => {
    const lastUpdatedAt = resin.updatedAt
    const minutesRemaining = Math.round((160 - resin.count) / 0.125)
    const approximateFullAt = addMinutes(lastUpdatedAt, minutesRemaining - DEFAULT_TIME_OFFFSET_MINUTES)

    const user = BOT.users.cache.get(resin.userId)

    console.log(`Scheduling notification for ${user?.username} at ${format(approximateFullAt, "MM/dd/yyyy HH:mm")}`)

    schedule.scheduleJob(approximateFullAt, async function () {
      const updatedResin = await client.resins.findUnique({ where: { userId: resin.userId } })
      if (updatedResin && updatedResin.shouldNotify) {
        const channel = BOT.channels.cache.get(process.env.NOTIFICATION_CHANNEL) as TextBasedChannel

        if (channel) {
          channel.send(`<@${updatedResin.userId}> Your resin is about to be completely refilled!`)
          console.info(`Notifying ${user?.username} that resin is about to be refilled`)
          await client.resins.update({
            where: {
              userId: updatedResin.userId,
            },
            data: {
              shouldNotify: false,
              notifiedAt: new Date()
            }
          })
        }
      }
    })

  })

}