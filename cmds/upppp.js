module.exports = {
  config: {
    name: "upppp",
    version: "___",
    author: "NAFIJ PRO",
    countDown: 0,
    role: 0,
    shortDescription: "___",
    longDescription: "___",
    category: "___",
    guide: {
      en: "___"
    },
    usePrefix: false
  },

  onStart: async function ({ message }) {
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    const nafij = `${h}h ${m}m ${s}s`;

    message.reply(`╭───────────╮\n│ ⏱️ ${nafij} │\n╰───────────╯`);
  }
};
