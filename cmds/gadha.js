const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "gadha",
    version: "1.0.0",
    author: "NAFIJ PRO",
    countDown: 5,
    role: 0,
    shortDescription: "Gadha meme 🐴 (Alt)",
    longDescription: "Replaces donkey face with a user's avatar (Alternate version)",
    category: "fun",
    guide: {
      en: "{pn} @mention or reply to someone to turn them into a gadha",
    },
  },

  onStart: async function ({ event, message, api }) {
    let targetID = Object.keys(event.mentions)[0];
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    }

    if (!targetID) {
      return message.reply("🐴 Tag or reply to someone to make them a gadha!");
    }

    if (targetID === event.senderID) {
      return message.reply("❗ Bro, why would you turn yourself into a gadha?");
    }

    const baseFolder = path.join(__dirname, "NAFIJ_gadha2");
    const bgPath = path.join(baseFolder, "gadha_bg.jpeg");
    const avatarPath = path.join(baseFolder, `avatar_${targetID}.png`);
    const outputPath = path.join(baseFolder, `gadha_result_${targetID}.png`);

    try {
      if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder);

      const gadhaImageURL = "https://raw.githubusercontent.com/alkama844/res/main/image/gadha.jpeg";
      if (!fs.existsSync(bgPath)) {
        const res = await axios.get(gadhaImageURL, { responseType: "arraybuffer" });
        fs.writeFileSync(bgPath, res.data);
      }

      const avatarBuffer = (
        await axios.get(
          `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;
      fs.writeFileSync(avatarPath, avatarBuffer);

      const avatarImg = await jimp.read(avatarPath);
      avatarImg.circle();
      await avatarImg.writeAsync(avatarPath);

      const bg = await jimp.read(bgPath);

      const avatarCircle = await jimp.read(avatarPath);

      avatarCircle.resize(160, 160); // Avatar size
      // **Adjusted X coordinate to move the avatar to the right (towards middle of face)**
      const x = 500; // Increased from 270
      const y = 330; // Y-coordinate remains same for now

      bg.composite(avatarCircle, x, y);

      const finalBuffer = await bg.getBufferAsync("image/png");
      fs.writeFileSync(outputPath, finalBuffer);

      const userInfo = await api.getUserInfo(targetID);
      const name = userInfo[targetID]?.name || "Someone";

      const randomMessages = [
        `Here is cute gadha 🐴❤️`,
        `Sundor lagse akdom ${name} er moto 😂`,
        `Dekh to ke asche! ${name} 🐴`,
        `Gadha 🤣 ${name} for you!`,
        `Oh wow, ${name} looks like a true gadha!`,
        `Ki dekhi ami! ${name} er gadha avatar!`,
      ];
      const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];

      await message.reply({
        body: randomMessage,
        mentions: [{ tag: name, id: targetID }],
        attachment: fs.createReadStream(outputPath),
      }, () => {
        fs.unlinkSync(avatarPath);
        fs.unlinkSync(outputPath);
      });

    } catch (err) {
      console.error("🐴 Gadha2 command error:", err);
      if (err.response && err.response.status === 404) {
        return message.reply("❌ Error: Could not download the gadha background image. Please check the URL.");
      }
      return message.reply("❌ সমস্যা হইসে ভাই। আরেকবার try দে।");
    }
  }
};
