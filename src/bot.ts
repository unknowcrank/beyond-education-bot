import { Client, GatewayIntentBits, Interaction } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const commands: any[] = [];

// Load commands
const commandFiles = fs
  .readdirSync(path.join(__dirname, "commands"))
  .filter((file) => file.endsWith(".js")); // Ensure you're checking for .js files

for (const file of commandFiles) {
  try {
    const command = require(path.join(__dirname, "commands", file)).command;
    commands.push(command);
  } catch (error) {
    console.error(`Error loading command ${file}:`, error);
  }
}

client.once("ready", async () => {
  const guild = await client.guilds.fetch(process.env.GUILD_ID!);
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

client.login(process.env.BOT_TOKEN);
