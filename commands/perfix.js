const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(process.cwd(), "config.json");

module.exports = {
  config: {
    name: "prefix",
    aliases: ["بادئة", "برفكس"],
    version: "1.0.0",
    author: "Shadow",
    role: 2, // 0=عادي، 1=أدمن مجموعة، 2=أدمن بوت
    description: "عرض أو تغيير بادئة البوت فوراً",
    category: "system",
    guide: {
      en: "{pn} | {pn} <new_prefix>",
      ar: "{pn} | {pn} <البادئة_الجديدة>"
    }
  },

  onStart: async function ({ api, event, args }) {
    // 1. قراءة config.json
    let config;
    try {
      const raw = fs.readFileSync(CONFIG_PATH, "utf8");
      config = JSON.parse(raw);
    } catch (e) {
      return api.sendMessage(
        "❌ تعذر قراءة config.json، تأكد من وجوده في جذر المشروع.",
        event.threadID,
        event.messageID
      );
    }

    const currentPrefix = config.prefix ?? "";

    // 2. بدون معاملات: عرض البادئة الحالية
    if (!args[0]) {
      return api.sendMessage(
        `📌 البادئة الحالية: "${currentPrefix}"\n` +
        `للتغيير: ${currentPrefix}prefix <البادئة الجديدة>\n` +
        `مثال: ${currentPrefix}prefix !`,
        event.threadID,
        event.messageID
      );
    }

    // 3. البادئة الجديدة
    const newPrefix = args[0];

    if (newPrefix.length > 5) {
      return api.sendMessage(
        "⚠️ البادئة طويلة جداً، الحد الأقصى 5 أحرف.",
        event.threadID,
        event.messageID
      );
    }

    // 4. تحديث الملف
    config.prefix = newPrefix;
    try {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
    } catch (e) {
      return api.sendMessage(
        "❌ فشل حفظ config.json، تحقق من أذونات الملف.",
        event.threadID,
        event.messageID
      );
    }

    // 5. 🔑 التحديث الفوري في الذاكرة (بدون إعادة تشغيل)
    try {
      if (global.GoatBot && global.GoatBot.config) {
        global.GoatBot.config.prefix = newPrefix;
      }
      // بعض النسخ تخزن البادئة في متغير عام آخر
      if (global.config) global.config.prefix = newPrefix;
      if (global.client && global.client.config) {
        global.client.config.prefix = newPrefix;
      }
    } catch (e) {
      // تجاهل أي خطأ هنا
    }

    return api.sendMessage(
      `✅ تم تغيير البادئة:\n` +
      `من: "${currentPrefix}"\n` +
      `إلى: "${newPrefix}"\n` +
      `⚡ التغيير ساري المفعول الآن بدون إعادة تشغيل.`,
      event.threadID,
      event.messageID
    );
  }
};