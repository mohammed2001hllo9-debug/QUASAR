const fs = require("fs");
const path = require("path");
const CONFIG_PATH = path.join(process.cwd(), "config.json");

module.exports = {
  config: {
    name: "admin",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "Shadow",
    description: "إدارة الأدمن",
    commandCategory: "system",
    usages: "admin (بالرد)",
    cooldowns: 0,
    aliases: ["ادمن"]
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID, type, messageReply } = event;
    let config;
    try { config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")); } catch (e) { return api.sendMessage("❌ تعذر قراءة config.json", threadID, messageID); }
    if (!Array.isArray(config.adminBot)) config.adminBot = [];

    if (args[0] === "list" || args[0] === "قائمة") {
      if (config.adminBot.length === 0) return api.sendMessage("📋 القائمة فارغة.", threadID, messageID);
      let msg = "📋 الأدمن:\n";
      for (let i = 0; i < config.adminBot.length; i++) {
        let name = "غير معروف";
        try { const info = await api.getUserInfo(config.adminBot[i]); if (info[config.adminBot[i]]) name = info[config.adminBot[i]].name; } catch (e) {}
        msg += `${i + 1}. ${name} (${config.adminBot[i]})\n`;
      }
      return api.sendMessage(msg, threadID, messageID);
    }

    if (args[0] === "remove" || args[0] === "ازالة") {
      const targetID = args[1];
      if (!targetID) return api.sendMessage("⚠️ اكتب الآيدي.", threadID, messageID);
      const index = config.adminBot.indexOf(targetID);
      if (index === -1) return api.sendMessage("❌ ليس في القائمة.", threadID, messageID);
      config.adminBot.splice(index, 1);
      try { fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8"); } catch (e) { return api.sendMessage("❌ فشل الحفظ.", threadID, messageID); }
      return api.sendMessage(`✅ تم إزالة: ${targetID}`, threadID, messageID);
    }

    if (type === "message_reply" && messageReply && args.length === 0) {
      const targetID = messageReply.senderID;
      if (config.adminBot.includes(targetID)) return api.sendMessage("⚠️ أدمن بالفعل.", threadID, messageID);
      config.adminBot.push(targetID);
      try { fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8"); } catch (e) { return api.sendMessage("❌ فشل الحفظ.", threadID, messageID); }
      return api.sendMessage(`✅ تم إضافة: ${targetID}`, threadID, messageID);
    }

    return api.sendMessage("📌 admin (بالرد) | admin list | admin remove <ID>", threadID, messageID);
  }
};
