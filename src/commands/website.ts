import { CommandInteraction } from "discord.js";

export const command = {
  name: "website",
  description: "Get the website URL",

  async execute(interaction: CommandInteraction) {
    await interaction.reply("https://www.beyond-education.de");
  },
};
