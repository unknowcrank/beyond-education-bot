import { Interaction } from "discord.js";
import fetch from "node-fetch";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const command = {
  name: "frage",
  description: "Frage den Chatbot etwas.",
  options: [
    {
      name: "frage",
      type: 3, // Updated this from "STRING" to 3
      description: "Deine Frage an den Chatbot",
      required: true,
    },
  ],

  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return;

    const commandInteraction =
      interaction as import("discord.js").CommandInteraction;

    // Check if the member has the "premium" role
    const member = await interaction.guild?.members.fetch(interaction.user.id);
    if (!member?.roles.cache.has("1163582247463559209")) {
      // 'premium' role ID
      await commandInteraction.reply(
        "Entschuldigung, nur Mitglieder mit der 'Premium' Rolle können diesen Befehl verwenden."
      );
      return;
    }

    const questionOption = commandInteraction.options.get("question");
    if (!questionOption || typeof questionOption.value !== "string") {
      await commandInteraction.reply("Ungültige Frage gestellt.");
      return;
    }

    // Acknowledge the interaction immediately.
    await commandInteraction.deferReply();

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "You're a Discord Bot, answer questions on German only! Don't use any other language!",
              },
              {
                role: "user",
                content: questionOption.value,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        console.error("OpenAI error response:", await response.json());
        // Update the reply to the interaction.
        await commandInteraction.editReply(
          "Sorry, I couldn't process that right now."
        );
        return;
      }

      const data = await response.json();
      const chatbotResponse = data.choices[0].message.content.trim();
      // Update the reply to the interaction.
      await commandInteraction.editReply(chatbotResponse);
    } catch (err) {
      console.error("Error querying OpenAI:", err);
      // Update the reply to the interaction.
      await commandInteraction.editReply(
        "Sorry, I couldn't process that right now."
      );
    }
  },
};
