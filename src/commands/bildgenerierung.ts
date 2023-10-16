import { Interaction } from "discord.js";
import fetch from "node-fetch";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const command = {
  name: "bildgenerierung",
  description: "Generiert ein Bild basierend auf einem gegebenen Prompt.",
  options: [
    {
      name: "beschreibung",
      type: 3,
      description: "Beschreiben Sie das gewünschte Bild.",
      required: true,
    },
  ],

  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return;

    const commandInteraction =
      interaction as import("discord.js").CommandInteraction;

    const beschreibungOption = commandInteraction.options.get("beschreibung");

    if (!beschreibungOption || typeof beschreibungOption.value !== "string") {
      await commandInteraction.reply("Ungültige Eingabe.");
      return;
    }

    await commandInteraction.deferReply();

    try {
      const response = await fetch(
        "https://api.openai.com/v1/images/generations",
        {
          // Adjust this URL based on the OpenAI's official API endpoint for DALL·E
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: beschreibungOption.value,
            n: 1,
            size: "1024x1024",
          }),
        }
      );

      if (!response.ok) {
        console.error("OpenAI error response:", await response.json());
        await commandInteraction.editReply(
          "Entschuldigung, ich konnte das Bild nicht generieren."
        );
        return;
      }

      const data = await response.json();
      const imageUrl = data.data[0].url;

      // Reply with the generated image URL
      await commandInteraction.editReply(imageUrl);
    } catch (err) {
      console.error("Error querying OpenAI:", err);
      await commandInteraction.editReply(
        "Entschuldigung, ich konnte das Bild nicht generieren."
      );
    }
  },
};
