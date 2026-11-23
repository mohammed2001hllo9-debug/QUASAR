const fs = require("fs");
const path = require("path");
const DATA_FILE = path.join(__dirname, "angel_data.json");

function loadData() { try { if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); } catch (e) {} return {}; }
function saveData(data) { try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8"); } catch (e) {} }
const timers = {};

function stopTimer(threadID) { if (timers[threadID]) { if (timers[threadID].stop) timers[threadID].stop(); delete timers[threadID]; } }

function startAngel(api, threadID, text, seconds) {
  stopTimer(threadID);
  let count = 0, paused = false, timeoutHandle = null;
  timers[threadID] = {
    interval: setInterval(async () => {
      if (paused) return;
      try {
        await api.sendMessage(text, threadID);
        count++;
        if (count >= 3) {
          paused = true; count = 0;
          timeoutHandle = setTimeout(async () => {
            try { await api.sendMessage("تم تسجيل هروبك 🤣", threadID); } catch (e) {}
            try { if (api.removeUserFromGroup) await api.removeUserFromGroup(api.getCurrentUserID(), threadID); } catch (e) {}
            stopTimer(threadID);
            const data = loadData(); delete data[threadID]; saveData(data);
          }, 16 * 60 * 1000);
        }
      } catch (e) {}
    }, seconds * 1000),
    stop: () => { if (timeoutHandle) clearTimeout(timeoutHandle); }
  };
}

module.exports = {
  config: {
    name: "angel",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Shadow",
    description: "يرسل رسائل ويغادر",
    commandCategory: "fun",
    usages: "angel (نص) (ثواني)",
    cooldowns: 0,
    aliases: ["انجل"]
  },

  run: async function ({ api, event }) {
    const body = (event.body || "").trim();
    const rest = body.replace(/^(angel|انجل)\s*/i, "").trim();
    const threadID = event.threadID;

    if (rest === "ايقاف") {
      stopTimer(threadID);
      return api.sendMessage("🛑 تم إيقاف Angel.", threadID, event.messageID);
    }

    const parts = rest.split(/\s+/);
    const seconds = parseInt(parts[parts.length - 1], 10);
    if (isNaN(seconds) || seconds <= 0) return api.sendMessage("⚠️ الصيغة: angel (نص) (ثواني)", threadID, event.messageID);
    
    const text = parts.slice(0, -1).join(" ").trim();
    if (!text) return api.sendMessage("⚠️ لم يتم العثور على نص.", threadID, event.messageID);

    const data = loadData(); data[threadID] = { text, seconds }; saveData(data);
    startAngel(api, threadID, text, seconds);

    return api.sendMessage(`✅ بدأ Angel: "${text}" كل ${seconds} ثانية.`, threadID, event.messageID);
  }
};
