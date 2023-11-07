import {
  Client,
  GatewayIntentBits,
  Interaction,
  TextChannel,
} from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const commands: any[] = [];

// Load commands
const commandFiles = fs
  .readdirSync(path.join(__dirname, "commands"))
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  try {
    const command = require(path.join(__dirname, "commands", file)).command;
    commands.push(command);
  } catch (error) {
    console.error(`Error loading command ${file}:`, error);
  }
}

client.once("ready", async () => {
  // Cleanup global commands
  const globalCommands = await client.application?.commands.fetch();
  if (globalCommands) {
    for (const [id, globalCommand] of globalCommands) {
      const localCommandExists = commands.some(
        (cmd) => cmd.name === globalCommand.name
      );
      if (!localCommandExists) {
        try {
          await client.application?.commands.delete(id);
          console.log(
            `🗑️ Deleted unused global command: ${globalCommand.name}`
          );
        } catch (error) {
          console.error(
            `Failed to delete global command ${globalCommand.name}:`,
            error
          );
        }
      }
    }
  }

  // Cleanup guild-specific commands
  const guild = await client.guilds.fetch(process.env.GUILD_ID!);
  const guildCommands = await guild.commands.fetch();
  for (const [id, guildCommand] of guildCommands) {
    const localCommandExists = commands.some(
      (cmd) => cmd.name === guildCommand.name
    );
    if (!localCommandExists) {
      try {
        await guild.commands.delete(id);
        console.log(`Deleted unused guild command: ${guildCommand.name}`);
      } catch (error) {
        console.error(
          `Failed to delete guild command ${guildCommand.name}:`,
          error
        );
      }
    }
  }

  // Register commands
  for (const command of commands) {
    try {
      await guild.commands.create({
        name: command.name,
        description: command.description,
        options: command.options || [],
      });
      console.log(`✅ Command {${command.name}} registered successfully.`);
    } catch (error) {
      console.error(`❌ Failed to register command ${command.name}: `, error);
    }
  }
  console.log("Bot is up and running!");
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;

  const command = commands.find((cmd) => cmd.name === interaction.commandName);
  if (command) {
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing command ${command.name}:`, error);
      await interaction.reply({
        content: "There was an error executing that command!",
        ephemeral: true,
      });
    }
  }
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId === "messageModal") {
    const messageContent = interaction.fields.getTextInputValue("messageInput");
    try {
      const targetChannel = interaction.client.channels.cache.get(
        "1163808598007230554"
      ) as TextChannel | undefined;
      if (targetChannel) {
        await targetChannel.send(messageContent);
        await interaction.reply({
          content: "Nachricht erfolgreich gesendet!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "Konnte den Kanal nicht finden oder Nachricht nicht senden.",
          ephemeral: true,
        });
      }
    } catch (err) {
      console.error("Error sending message:", err);
      await interaction.reply({
        content: "Es gab einen Fehler beim Senden der Nachricht.",
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.BOT_TOKEN);
