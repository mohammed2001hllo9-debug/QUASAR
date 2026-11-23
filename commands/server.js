const os = require("os");

module.exports = {
  config: {
    name: "server",
    aliases: ["سيرفر", "نظام"],
    version: "1.0.0",
    author: "Shadow",
    role: 0,
    description: "عرض معلومات النظام (التشغيل، الرام، المعالج)",
    category: "system",
    guide: {
      en: "{pn}",
      ar: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    // 1. مدة تشغيل النظام (System Uptime)
    const uptimeSeconds = os.uptime();
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    
    let uptimeStr = "";
    if (days > 0) uptimeStr += `${days} يوم `;
    if (hours > 0) uptimeStr += `${hours} ساعة `;
    uptimeStr += `${minutes} دقيقة`;

    // 2. معلومات الرام (Memory)
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    const formatBytes = (bytes) => (bytes / (1024 ** 3)).toFixed(2) + " GB";
    
    const memStr = `المستخدم: ${formatBytes(usedMem)} / الإجمالي: ${formatBytes(totalMem)}`;

    // 3. معلومات المعالج (CPU)
    const cpus = os.cpus();
    const cpuModel = cpus[0].model;
    const cpuCores = cpus.length;
    const cpuSpeed = cpus[0].speed; // MHz

    const cpuStr = `${cpuModel} (${cpuCores} نواة @ ${cpuSpeed} MHz)`;

    // 4. بناء الرسالة النهائية
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