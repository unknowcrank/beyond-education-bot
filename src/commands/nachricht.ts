import {
  CommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";

export const command = {
  name: "nachricht",
  description: "Sendet eine Nachricht in einen bestimmten Channel.",
  options: [],

  async execute(interaction: CommandInteraction) {
    const member = await interaction.guild?.members.fetch(interaction.user.id);
    if (!member?.roles.cache.has("1163832228250386573")) {
      await interaction.reply({
        content:
          "**❌ Error:** Nur Administrator von Beyond Education können dieses Slashcommand nutzen!",
        ephemeral: true,
      });

      return;
    }

    // Create the modal
    const modal = new ModalBuilder()
      .setCustomId("messageModal")
      .setTitle("Gebe deine Nachricht ein");

    // Create the text input components
    const messageInput = new TextInputBuilder()
      .setCustomId("messageInput")
      .setLabel("Gebe hier deine Nachricht ein")
      .setStyle(TextInputStyle.Paragraph);

    // An action row only holds one text input
    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
      messageInput
    );

    // Add inputs to the modal
    modal.addComponents(actionRow);

    // Show the modal to the user
    await interaction.showModal(modal);
  },
};
