const os = require("os");

module.exports = {
  config: {
    name: "server",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Shadow",
    description: "عرض معلومات النظام",
    commandCategory: "system",
    usages: "",
    cooldowns: 5,
    aliases: ["سيرفر", "نظام"]
  },

  run: async function ({ api, event }) {
    const uptimeSeconds = os.uptime();
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    
    let uptimeStr = "";
    if (days > 0) uptimeStr += `${days} يوم `;
    if (hours > 0) uptimeStr += `${hours} ساعة `;
    uptimeStr += `${minutes} دقيقة`;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const formatBytes = (bytes) => (bytes / (1024 ** 3)).toFixed(2) + " GB";
    const memStr = `المستخدم: ${formatBytes(usedMem)} / الإجمالي: ${formatBytes(totalMem)}`;

    const cpus = os.cpus();
    const cpuModel = cpus[0].model;
    const cpuCores = cpus.length;
    const cpuSpeed = cpus[0].speed;
    const cpuStr = `${cpuModel} (${cpuCores} نواة @ ${cpuSpeed} MHz)`;

    const message = `🖥️ **معلومات النظام** 🖥️
━━━━━━━━━━━━━━━
⏱️ **التشغيل:** ${uptimeStr}
🧠 **الرام:** ${memStr}
⚙️ **المعالج:** ${cpuStr}
━━━━━━━━━━━━━━━
𝐅𝐄𝐋𝐈𝐗 「🇩🇪」`;

    return api.sendMessage(message, event.threadID, event.messageID);
  }
};
