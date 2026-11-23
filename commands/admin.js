const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(process.cwd(), "config.json");

module.exports = {
  config: {
    name: "admin",
    aliases: ["ادمن"],
    version: "1.0.0",
    author: "Shadow",
    role: 2, // فقط أدمن البوت الحالي يمكنه استخدام الأمر
    description: "إضافة أو إزالة أدمن للبوت (محاولة)",
    category: "system",
    guide: {
      en: "admin (reply) | admin list | admin remove <ID>",
      ar: "admin (بالرد) | admin list | admin remove <ID>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID, type, messageReply } = event;
    
    let config;
    try {
      config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    } catch (e) {
      return api.sendMessage("❌ تعذر قراءة config.json.", threadID, messageID);
    }

    // التأكد من وجود مصفوفة adminBot
    if (!Array.isArray(config.adminBot)) config.adminBot = [];

    // 1. عرض القائمة: admin list
    if (args[0] === "list" || args[0] === "قائمة") {
      if (config.adminBot.length === 0) {
        return api.sendMessage("📋 قائمة الأدمن فارغة.", threadID, messageID);
      }
      let msg = "📋 قائمة أدمن البوت:\n";
      for (let i = 0; i < config.adminBot.length; i++) {
        let name = "غير معروف";
        try {
          const info = await api.getUserInfo(config.adminBot[i]);
          if (info && info[config.adminBot[i]]) name = info[config.adminBot[i]].name;
        } catch (e) {}
        msg += `${i + 1}. ${name} (${config.adminBot[i]})\n`;
      }
      msg += "\nلإزالة أدمن: admin remove <ID>";
      return api.sendMessage(msg, threadID, messageID);
    }

    // 2. إزالة أدمن: admin remove <ID>
    if (args[0] === "remove" || args[0] === "ازالة") {
      const targetID = args[1];
      if (!targetID) return api.sendMessage("⚠️ اكتب الآيدي بعد remove.", threadID, messageID);
      
      const index = config.adminBot.indexOf(targetID);
      if (index === -1) return api.sendMessage("❌ هذا الآيدي ليس في القائمة.", threadID, messageID);
      
      config.adminBot.splice(index, 1);
      try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
        // محاولة تحديث الذاكرة
        if (global.GoatBot && global.GoatBot.config) global.GoatBot.config.adminBot = config.adminBot;
      } catch (e) {
        return api.sendMessage("❌ فشل حفظ التغييرات.", threadID, messageID);
      }
      return api.sendMessage(`✅ تم إزالة الأدمن: ${targetID}`, threadID, messageID);
    }

    // 3. إضافة أدمن بالرد: admin (reply)
    if (type === "message_reply" && messageReply && args.length === 0) {
      const targetID = messageReply.senderID;
      if (config.adminBot.includes(targetID)) {
        return api.sendMessage("⚠️ هذا المستخدم أدمن بالفعل.", threadID, messageID);
      }
      config.adminBot.push(targetID);
      try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
        if (global.GoatBot && global.GoatBot.config) global.GoatBot.config.adminBot = config.adminBot;
      } catch (e) {
        return api.sendMessage("❌ فشل حفظ التغييرات.", threadID, messageID);
      }
      return api.sendMessage(`✅ تم إضافة الأدمن: ${targetID}`, threadID, messageID);
    }

    // 4. تعليمات
    return api.sendMessage(
      "📌 أوامر الأدمن:\n" +
      "• admin (بالرد على شخص) — إضافته كأدمن\n" +
      "• admin list — عرض القائمة\n" +
      "• admin remove <ID> — إزالة أدمن",
      threadID, messageID
    );
  }
};