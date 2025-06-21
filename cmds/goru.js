const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "goru",
    version: "1.0.0",
    author: "NAFIJ PRO",
    countDown: 5,
    role: 0,
    shortDescription: "Goru meme 🐮",
    longDescription: "Replaces cow face with a user's avatar",
    category: "fun",
    guide: {
      en: "{pn} @mention or reply to someone to turn them into a goru",
    },
  },

  onStart: async function ({ event, message, api }) {
    let targetID = Object.keys(event.mentions)[0];
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    }

    if (!targetID) return message.reply("🐮 Tag or reply to someone to make them a goru!");

    const baseFolder = path.join(__dirname, "NAFIJ");
    const bgPath = path.join(baseFolder, "goru_bg.jpg");
    const avatarPath = path.join(baseFolder, `avatar_${targetID}.png`);
    const outputPath = path.join(baseFolder, `goru_result_${targetID}.png`);

    try {
      if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder);

      // Download cow image if missing
      if (!fs.existsSync(bgPath)) {
        const url = "https://raw.githubusercontent.com/alkama844/res/refs/heads/main/image/goru.jpg";
        const res = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(bgPath, res.data);
      }

      // Download avatar
      const avatarBuffer = (
        await axios.get(
          `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;
      fs.writeFileSync(avatarPath, avatarBuffer);

      const bg = await jimp.read(bgPath);
      const avatar = await jimp.read(avatarPath);
      avatar.resize(160, 160).circle(); // round avatar

      // Place avatar over cow's face
      const x = 280;
      const y = 90;
      bg.composite(avatar, x, y);

      await bg.writeAsync(outputPath);

      const userInfo = await api.getUserInfo(targetID);
      const name = userInfo[targetID]?.name || "Someone";

      await message.reply({
        body: `🤣 ${name} is now a goru reading the newspaper! 🐄🗞️`,
        mentions: [{ tag: name, id: targetID }],
        attachment: fs.createReadStream(outputPath),
      }, () => {
        fs.unlinkSync(avatarPath);
        fs.unlinkSync(outputPath);
      });

    } catch (err) {
      console.error("🐮 Goru command error:", err);
      return message.reply("❌ Error while turning into goru.");
    }
  }
};
