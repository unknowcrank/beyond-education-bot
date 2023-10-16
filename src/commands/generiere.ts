import { Interaction } from "discord.js";
import fetch from "node-fetch";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const command = {
  name: "generiere",
  description: "Generiere ein verschiedene nützliche Dinge.",
  options: [
    {
      name: "auswahl", // Corrected here
      type: 3,
      description: "Was möchtest du generieren lassen?.",
      required: true,
      choices: [
        {
          name: "Unterrichtsentwürfe",
          value: "unterrichtsentwürfe",
        },
      ],
    },
    {
      name: "thema", // Corrected here
      type: 3,
      description: "Das Thema der Stunde, z.B, 'zweiter Weltkrieg'",
      required: true,
    },
    {
      name: "fach", // Corrected here
      type: 3,
      description: "Das Fach der Stunde, z.B, 'Geschichte'",
      required: true,
      choices: [
        {
          name: "Geschichte",
          value: "Geschichte",
        },
        {
          name: "Deutsch",
          value: "Deutsch",
        },
        {
          name: "Englisch",
          value: "Englisch",
        },
        {
          name: "Mathe",
          value: "Mathe",
        },
        {
          name: "Physik",
          value: "Physik",
        },
        {
          name: "Chemie",
          value: "Chemie",
        },
        {
          name: "Biologie",
          value: "Biologie",
        },
        {
          name: "Informatik",
          value: "Informatik",
        },
        {
          name: "Musik",
          value: "Musik",
        },
        {
          name: "Kunst",
          value: "Kunst",
        },
        {
          name: "Sport",
          value: "Sport",
        },
        {
          name: "Religion",
          value: "Religion",
        },
        {
          name: "Ethik",
          value: "Ethik",
        },
        {
          name: "Politik",
          value: "Politik",
        },
        {
          name: "Wirtschaft",
          value: "Wirtschaft",
        },
        {
          name: "Geographie",
          value: "Geographie",
        },
        {
          name: "Philosophie",
          value: "Philosophie",
        },
        {
          name: "Psychologie",
          value: "Psychologie",
        },
        {
          name: "Sachunterricht",
          value: "Sachunterricht",
        },
      ],
    },
    {
      name: "dauer", // Corrected here
      type: 3,
      description: "Die Dauer der Stunde, z.B, '90 minuten'",
      choices: [
        {
          name: "45 minuten",
          value: "45 minuten",
        },
        {
          name: "60 minuten",
          value: "60 minuten",
        },
        {
          name: "90 minuten",
          value: "90 minuten",
        },
      ],
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

    // Get options from the command
    const selectionOption = commandInteraction.options.get("auswahl");
    const topicOption = commandInteraction.options.get("thema");
    const fachOption = commandInteraction.options.get("fach");
    const durationOption = commandInteraction.options.get("dauer");

    // Validate options
    if (
      !selectionOption ||
      typeof selectionOption.value !== "string" ||
      !topicOption ||
      typeof topicOption.value !== "string" ||
      !fachOption ||
      typeof fachOption.value !== "string" ||
      !durationOption ||
      typeof durationOption.value !== "string"
    ) {
      console.log("Selection:", selectionOption?.value);
      console.log("Thema:", topicOption?.value);
      console.log("Fach:", fachOption?.value);
      console.log("Dauer:", durationOption?.value);
      await commandInteraction.reply("Ungültige Eingabe.");
      return;
    }

    // Acknowledge the interaction immediately
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
                  "You're a Discord Bot. Generate 'unterrichtsentwürfe' in German based on the given topic, fach, and duration.",
              },
              {
                role: "user",
                content: `Thema: ${topicOption.value}, Fach: ${fachOption.value}, Dauer: ${durationOption.value}`,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        console.error("OpenAI error response:", await response.json());
        await commandInteraction.editReply(
          "Entschuldigung, ich konnte das gerade nicht verarbeiten."
        );
        return;
      }

      const data = await response.json();
      let chatbotResponse = data.choices[0].message.content.trim();

      // Ensure the output is capped at 1900 characters
      if (chatbotResponse.length > 1900) {
        chatbotResponse = chatbotResponse.substring(0, 1897) + "...";
      }

      await commandInteraction.editReply(chatbotResponse);
    } catch (err) {
      console.error("Error querying OpenAI:", err);
      await commandInteraction.editReply(
        "Entschuldigung, ich konnte das gerade nicht verarbeiten."
      );
    }
  },
};
