const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "تشغيل"],
    version: "1.0.0",
    author: "Shadow",
    role: 0,
    description: "عرض وقت تشغيل البوت",
    category: "system",
    guide: {
      en: "{pn}",
      ar: "{pn}"
    }
  },

  onStart: async function ({ api, event, args }) {
    const uptime = process.uptime();

    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    let timeString = "";
    if (days > 0) timeString += `${days} يوم `;
    if (hours > 0) timeString += `${hours} ساعة `;
    if (minutes > 0) timeString += `${minutes} دقيقة `;
    timeString += `${seconds} ثانية`;
    timeString = timeString.trim();

    const startDate = new Date(Date.now() - uptime * 1000);
    const startTime = startDate.toLocaleString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });

    // قراءة آيدي الأدمن من config.js
    let adminID = "غير محدد";
    try {
      const configPath = path.join(process.cwd(), "config.js");
      delete require.cache[require.resolve(configPath)];
      const config = require(configPath);
      adminID = config.ADMINBOT || config.ADMIN_BOT || config.adminBot || "غير محدد";
      if (Array.isArray(adminID)) adminID = adminID.join(", ");
    } catch (e) {
      adminID = "غير محدد";
    }

    const message = `𝗘𝗱𝘄𝗶𝗻
𝗕𝗼𝘁: 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱 🟢
𝗨𝗽𝘁𝗶𝗺𝗲: ${timeString}
𝗦𝘁𝗮𝗿𝘁 𝗧𝗶𝗺𝗲: ${startTime}
𝗔𝗱𝗺𝗶𝗻 𝗕𝗼𝘁: ${adminID}
𝐅𝐄𝐋𝐈𝐗 「🇩🇪」`;

    return api.sendMessage(message, event.threadID, event.messageID);
  }
};
