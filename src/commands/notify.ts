import { SlashCommandBuilder } from "@discordjs/builders";
import addMinutes from "date-fns/addMinutes";
import { CommandInteraction, TextBasedChannel } from "discord.js";

import { ICommand } from "../interfaces";
import {
  getClient,
  BOT,
  scheduleJob,
  DEFAULT_TIME_OFFFSET_MINUTES
} from "../utils";

export const notify: ICommand = {
  data: new SlashCommandBuilder()
    .setName("notify")
    .setDescription("Notify when resin is about to be completely refilled"),

  run: async (interaction: CommandInteraction) => {

    await interaction.deferReply()
    const { user } = interaction

    const client = getClient()

    try {
      const resin = await client.resins.findUnique({
        where: {
          userId: user.id,
        }
      })


      if (resin) {
        const lastUpdatedAt = resin.updatedAt
        const minutesRemaining = Math.round((160 - resin.count) / 0.125)
        if (minutesRemaining === 0) {
          await interaction.editReply(`Your resin is already full!`)
          await client.resins.update({
            where: {
              userId: user.id,
            },
            data: {
              shouldNotify: false,
              notifiedAt: new Date(),
            }
          })
          return
        }

        const approximateFullAt = addMinutes(lastUpdatedAt, minutesRemaining - DEFAULT_TIME_OFFFSET_MINUTES)

        if (approximateFullAt < new Date()) {
          await interaction.editReply(`Your resin is almost full!`)
          await client.resins.update({
            where: {
              userId: user.id,
            },
            data: {
              shouldNotify: false,
              notifiedAt: new Date(),
            }
          })
          return
        }

        await client.resins.update({
          where: {
            userId: user.id,
          },
          data: {
            shouldNotify: true,
            notifiedAt: null,
          }
        })


        await interaction.editReply(`You will be notified when resin is about to be completely refilled.`)

        scheduleJob(user.id, approximateFullAt, async function () {
          console.info(`Notifying ${user.username} that resin is about to be refilled`)
          const resin = await client.resins.findUnique({
            where: {
              userId: user.id,
            }
          })
          if (resin && resin.shouldNotify) {
            const channel = BOT.channels.cache.get(process.env.NOTIFICATION_CHANNEL) as TextBasedChannel
            if (channel) {
              channel.send(`<@${user.id}> Your resin is about to be completely refilled!`)
              console.info(`Notified ${user.username} that resin is about to be refilled`)
              await client.resins.update({
                where: {
                  userId: user.id,
                },
                data: {
                  shouldNotify: false,
                  notifiedAt: new Date(),
                }
              })
            }

          }
        })

      } else {
        await interaction.editReply({
          content: `You don't have a saved resin count. Use the command \`reset\` to update your resin count`,
        })
      }
    } catch (err) {
      console.error(err)
      await interaction.editReply({
        content: `Error setting notifications`,
      })
    }
  }
}