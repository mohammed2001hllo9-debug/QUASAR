const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "engine_data.json");

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (e) {}
  return {};
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {}
}

// المؤقتات النشطة: threadID -> interval
const timers = {};

function startTimer(api, threadID, text, seconds) {
  stopTimer(threadID);
  timers[threadID] = setInterval(() => {
    api.sendMessage(text, threadID).catch(() => {});
  }, seconds * 1000);
}

function stopTimer(threadID) {
  if (timers[threadID]) {
    clearInterval(timers[threadID]);
    delete timers[threadID];
  }
}

// تحويل الوقت: 300s / 5m / 2h / 30 (ثوانٍ افتراضياً)
function parseTime(str) {
  str = str.toLowerCase().trim();
  const match = str.match(/^(\d+)\s*(s|m|h|ث|د|س)?$/);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  const unit = match[2] || "s";
  if (unit === "s" || unit === "ث") return num;
  if (unit === "m" || unit === "د") return num * 60;
  if (unit === "h" || unit === "س") return num * 3600;
  return num;
}

module.exports = {
  config: {
    name: "محرك",
    aliases: ["engine"],
    version: "1.0.0",
    author: "Shadow",
    role: 0,
    description: "حفظ رسالة وتكرارها تلقائياً بفاصل زمني",
    category: "system",
    guide: {
      en: "محرك رسالة (نص) | محرك تشغيل | محرك ايقاف | محرك وقت 300s",
      ar: "محرك رسالة (نص) | محرك تشغيل | محرك ايقاف | محرك وقت 300s"
    }
  },

  onChat: async function ({ api, event }) {
    const body = (event.body || "").trim();
    if (!/^محرك(\s|$)/.test(body) && !/^engine(\s|$)/i.test(body)) return;

    const rest = body.replace(/^(محرك|engine)\s*/i, "").trim();
    const threadID = event.threadID;
    const data = loadData();

    // التأكد من وجود سجل للمجموعة
    if (!data[threadID]) data[threadID] = { text: "", seconds: 0 };

    // ============ محرك رسالة (نص) ============
    if (/^رسالة\s+/.test(rest)) {
      const text = rest.replace(/^رسالة\s+/, "").trim();
      if (!text) {
        return api.sendMessage("⚠️ اكتب النص بعد كلمة رسالة.\nمثال: محرك رسالة مرحبا بالجميع", threadID, event.messageID);
      }
      data[threadID].text = text;
      saveData(data);
      return api.sendMessage(`💾 تم حفظ الرسالة:\n"${text}"`, threadID, event.messageID);
    }

    // ============ محرك وقت (مدة) ============
    if (/^وقت\s+/.test(rest)) {
      const timeStr = rest.replace(/^وقت\s+/, "").trim();
      const seconds = parseTime(timeStr);
      if (!seconds || seconds <= 0) {
        return api.sendMessage(
          "⚠️ صيغة غير صحيحة.\nأمثلة: محرك وقت 300s | محرك وقت 5m | محرك وقت 2h",
          threadID,
          event.messageID
        );
      }
      data[threadID].seconds = seconds;
      saveData(data);

      // إذا كان التكرار شغّالاً، أعد تشغيله بالمدة الجديدة
      if (timers[threadID] && data[threadID].text) {
        startTimer(api, threadID, data[threadID].text, seconds);
      }

      return api.sendMessage(`⏱️ تم ضبط الوقت: كل ${seconds} ثانية`, threadID, event.messageID);
    }

    // ============ محرك تشغيل ============
    if (rest === "تشغيل" || rest.toLowerCase() === "start") {
      if (!data[threadID].text) {
        return api.sendMessage("⚠️ لا توجد رسالة محفوظة. احفظها أولاً:\nمحرك رسالة (نص)", threadID, event.messageID);
      }
      if (!data[threadID].seconds || data[threadID].seconds <= 0) {
        return api.sendMessage("⚠️ لم تحدد الوقت. استخدم:\nمحرك وقت 300s", threadID, event.messageID);
      }
      startTimer(api, threadID, data[threadID].text, data[threadID].seconds);
      return api.sendMessage(
        `✅ تم التشغيل:\n📝 "${data[threadID].text}"\n⏱️ كل ${data[threadID].seconds} ثانية`,
        threadID,
        event.messageID
      );
    }

    // ============ محرك ايقاف ============
    if (rest === "ايقاف" || rest === "إيقاف" || rest.toLowerCase() === "stop") {
      stopTimer(threadID);
      return api.sendMessage("🛑 تم إيقاف التكرار (الرسالة والوقت محفوظان).", threadID, event.messageID);
    }

    // ============ محرك حذف ============
    if (rest === "حذف") {
      stopTimer(threadID);
      delete data[threadID];
      saveData(data);
      return api.sendMessage("🗑️ تم حذف الرسالة والإعدادات بالكامل.", threadID, event.messageID);
    }

    // ============ محرك حالة ============
    if (rest === "حالة" || rest === "status") {
      const d = data[threadID];
      const running = timers[threadID] ? "🟢 يعمل" : "🔴 متوقف";
      return api.sendMessage(
        `📊 الحالة: ${running}\n📝 النص: ${d.text || "لا يوجد"}\n⏱️ الوقت: ${d.seconds || 0} ثانية`,
        threadID,
        event.messageID
      );
    }

    // ============ مساعدة ============
    return api.sendMessage(
      "📌 أوامر المحرك:\n" +
      "• محرك رسالة (نص) — حفظ النص\n" +
      "• محرك وقت 300s — تحديد الفاصل الزمني\n" +
      "• محرك تشغيل — بدء الإرسال\n" +
      "• محرك ايقاف — إيقاف الإرسال\n" +
      "• محرك حالة — عرض الحالة\n" +
      "• محرك حذف — حذف كل شيء",
      threadID,
      event.messageID
    );
  },

  onLoad: async function ({ api }) {
    const data = loadData();
    for (const threadID in data) {
      const { text, seconds } = data[threadID];
      if (text && seconds > 0) startTimer(api, threadID, text, seconds);
    }
  }
};
