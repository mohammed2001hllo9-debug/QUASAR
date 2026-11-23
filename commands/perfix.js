const fs = require("fs");
const path = require("path");
const CONFIG_PATH = path.join(process.cwd(), "config.json");

module.exports = {
  config: {
    name: "prefix",
    version: "1.0.0",
    hasPermssion: 2, // أدمن البوت فقط
    credits: "Shadow",
    description: "تغيير البادئة",
    commandCategory: "system",
    usages: "prefix <جديد>",
    cooldowns: 3,
    aliases: ["بادئة"]
  },

  run: async function ({ api, event, args }) {
    let config;
    try { config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")); } catch (e) { return api.sendMessage("❌ تعذر قراءة config.json", event.threadID, event.messageID); }
    
    if (!args[0]) return api.sendMessage(`📌 البادئة الحالية: "${config.prefix || ''}"`, event.threadID, event.messageID);
    
    const newPrefix = args[0];
    if (newPrefix.length > 5) return api.sendMessage("⚠️ البادئة طويلة جداً.", event.threadID, event.messageID);

    config.prefix = newPrefix;
    try {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
      if (global.GoatBot && global.GoatBot.config) global.GoatBot.config.prefix = newPrefix;
      if (global.config) global.config.prefix = newPrefix;
    } catch (e) {
      return api.sendMessage("❌ فشل حفظ التغييرات.", event.threadID, event.messageID);
    }
    return api.sendMessage(`✅ تم تغيير البادئة إلى: "${newPrefix}"`, event.threadID, event.messageID);
  }
};
