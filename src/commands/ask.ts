import { Interaction } from "discord.js";
import fetch from "node-fetch";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const command = {
  name: "ask",
  description: "Ask the chatbot a question",
  options: [
    {
      name: "question",
      type: 3, // Updated this from "STRING" to 3
      description: "Your question for the chatbot",
      required: true,
    },
  ],

  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return;

    const commandInteraction =
      interaction as import("discord.js").CommandInteraction;

    const questionOption = commandInteraction.options.get("question");
    if (!questionOption || typeof questionOption.value !== "string") {
      await commandInteraction.reply("Invalid question provided.");
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
