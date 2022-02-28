import { SlashCommandBuilder } from "@discordjs/builders";
import differenceInMinutes from "date-fns/differenceInMinutes"
import { CommandInteraction } from "discord.js";

import { ICommand } from "../interfaces/command";
import { getClient } from "../utils/getClient";


export const resin: ICommand = {
  data: new SlashCommandBuilder()
    .setName("resin")
    .setDescription("Shows current resin count"),

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

      // rate of resin per minute
      const RESIN_RATE = 0.125

      if (resin) {
        // update the resin count
        // new resin count = old resin count + time * rate

        let newCount = Math.round(resin.resinCount + differenceInMinutes(new Date(), resin.updatedAt) * RESIN_RATE)
        if (newCount > 160) {
          newCount = 160
        }

        // update the resin count
        await client.resins.update({
          where: {
            userId: user.id,
          },
          data: {
            resinCount: newCount,
          }
        })

        let content = `You have ${newCount} resins`
        if (newCount < 160) {
          content += `\nYour resins will refill in about ${Math.round((160 - newCount) / RESIN_RATE)} minutes`
        }

        await interaction.editReply({
          content
        })
      } else {
        await interaction.editReply({
          content: `You have no resin count. Use the command \`reset\` to update your resin count`,
        })
      }

    } catch (err) {
      console.error(err)
      await interaction.editReply({
        content: `Error fetching resin count`,
      })
    }
  }
}

