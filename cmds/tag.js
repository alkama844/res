const config = {
  name: "tag",
  version: "1.0",
  author: "DIPTO AND MODED BY NAFIJ 🙂",
  credits: "___",
  countDown: 0,
  role: 0,
  hasPermission: 0,
  description: "___",
  category: "___",
  commandCategory: "___",
  guide: "___",
  usages: "___"
};

const fallbackMessages = [
  "Kire koi tui",
  "Vai Seen kor 🙂🙏",
  "Seen na korle tui akta kutta",
  "নারী জাতির ছলনায় মানুষ কিভাবে ধ্বংস হয় দেখেন 🤣😭"
];

const onStart = async ({ api, args, event }) => {
  try {
    let targetID = null;
    const isHidden = args.includes("--hide");
    if (isHidden) args = args.filter(a => a !== "--hide");

    if (event.messageReply) targetID = event.messageReply.senderID;
    else if (event.mentions && Object.keys(event.mentions).length > 0) targetID = Object.keys(event.mentions)[0];
    else if (args[0] && /^\d+$/.test(args[0])) {
      targetID = args[0];
      args.shift();
    }

    if (!targetID) {
      return api.sendMessage("Please reply to, mention, or provide a user ID to tag.", event.threadID, event.messageID);
    }

    if (targetID === event.senderID) {
      return api.sendMessage("You cannot tag yourself like that.", event.threadID, event.messageID);
    }

    const userInfo = await api.getUserInfo(targetID);
    const userName = userInfo[targetID]?.name || "Someone";
    const senderName = userInfo[event.senderID]?.name || "Someone";

    let messageText = args.join(" ").trim();

    if (!messageText) {
      if (userName.toLowerCase().includes("nikeke")) {
        messageText = "নারী জাতির ছলনায় মানুষ কিভাবে ধ্বংস হয় দেখেন 🤣😭";
      } else {
        messageText = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
      }
    }

    if (messageText.length > 200) {
      return api.sendMessage("Message is too long. Limit to 200 characters.", event.threadID, event.messageID);
    }

    const now = new Date();
    const timestamp = now.toLocaleTimeString("en-US", { hour12: true });

    const finalMessage = `${userName}, ${messageText}\nTime: ${timestamp}`;

    const msgData = {
      body: finalMessage,
      mentions: [{ tag: userName, id: targetID }]
    };

    const sent = await api.sendMessage(msgData, event.threadID, event.messageID);

    if (isHidden && sent?.messageID) {
      setTimeout(() => {
        api.unsendMessage(sent.messageID);
      }, 3000);
    }

  } catch (err) {
    return api.sendMessage("An error occurred while tagging.", event.threadID, event.messageID);
  }
};

module.exports = {
  config,
  onStart,
  run: onStart
};
