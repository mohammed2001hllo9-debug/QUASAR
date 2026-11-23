const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "angel_data.json");

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

const timers = {};

function stopTimer(threadID) {
  if (timers[threadID]) {
    clearInterval(timers[threadID]);
    delete timers[threadID];
  }
}

// بدء سلسلة الرسائل
function startAngel(api, threadID, text, seconds) {
  stopTimer(threadID);

  let count = 0;
  let paused = false;
  let timeoutHandle = null;

  timers[threadID] = {
    interval: setInterval(async () => {
      if (paused) return;

      try {
        await api.sendMessage(text, threadID);
        count++;

        // إذا وصل 3 رسائل متتالية
        if (count >= 3) {
          paused = true;
          count = 0;

          // انتظار 16 دقيقة = 16 * 60 * 1000
          timeoutHandle = setTimeout(async () => {
            try {
              await api.sendMessage("تم تسجيل هروبك 🤣", threadID);
            } catch (e) {}

            // مغادرة المجموعة
            try {
              if (api.removeUserFromGroup) {
                await api.removeUserFromGroup(api.getCurrentUserID(), threadID);
              }
            } catch (e) {}

            // إيقاف كل شيء وتنظيف البيانات
            stopTimer(threadID);
            const data = loadData();
            delete data[threadID];
            saveData(data);
          }, 16 * 60 * 1000);
        }
      } catch (e) {}
    }, seconds * 1000),

    stop: () => {
      if (timeoutHandle) clearTimeout(timeoutHandle);
    }
  };
}

module.exports = {
  config: {
    name: "angel",
    aliases: ["انجل", "ملاك"],
    version: "1.0.0",
    author: "Shadow",
    role: 0,
    description: "يرسل رسائل متكررة ثم يغادر بعد 16 دقيقة",
    category: "fun",
    guide: {
      en: "angel (النص) (الثواني)",
      ar: "angel (النص) (الثواني)"
    }
  },

  onChat: async function ({ api, event }) {
    const body = (event.body || "").trim();
    if (!/^angel(\s|$)/i.test(body) && !/^انجل(\s|$)/i.test(body) && !/^ملاك(\s|$)/i.test(body)) return;

    const rest = body.replace(/^(angel|انجل|ملاك)\s*/i, "").trim();
    const threadID = event.threadID;

    // إيقاف
    if (rest === "ايقاف" || rest === "إيقاف" || rest.toLowerCase() === "stop") {
      const t = timers[threadID];
      if (t && t.stop) t.stop();
      stopTimer(threadID);
      const data = loadData();
      delete data[threadID];
      saveData(data);
      return api.sendMessage("🛑 تم إيقاف Angel.", threadID, event.messageID);
    }

    // استخراج الثواني من آخر كلمة
    const parts = rest.split(/\s+/);
    const lastPart = parts[parts.length - 1];
    const seconds = parseInt(lastPart, 10);

    if (isNaN(seconds) || seconds <= 0) {
      return api.sendMessage(
        "⚠️ الصيغة: angel (النص) (الثواني)\nمثال: angel مرحبا 5",
        threadID,
        event.messageID
      );
    }

    const text = parts.slice(0, -1).join(" ").trim();
    if (!text) {
      return api.sendMessage("⚠️ لم يتم العثور على نص.", threadID, event.messageID);
    }

    // حفظ البيانات
    const data = loadData();
    data[threadID] = { text, seconds };
    saveData(data);

    // بدء
    startAngel(api, threadID, text, seconds);

    return api.sendMessage(
      `✅ بدأ Angel:\n📝 النص: ${text}\n⏱️ كل: ${seconds} ثانية\n⚠️ بعد 3 رسائل متتالية سيتوقف 16 دقيقة ثم يغادر.`,
      threadID,
      event.messageID
    );
  }
};