const fs = require("fs");
const path = require("path");
const DATA_FILE = path.join(__dirname, "engine_data.json");

function loadData() { try { if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); } catch (e) {} return {}; }
function saveData(data) { try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8"); } catch (e) {} }
const timers = {};

function startTimer(api, threadID, text, seconds) {
  stopTimer(threadID);
  timers[threadID] = setInterval(() => { api.sendMessage(text, threadID).catch(() => {}); }, seconds * 1000);
}
function stopTimer(threadID) { if (timers[threadID]) { clearInterval(timers[threadID]); delete timers[threadID]; } }
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
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Shadow",
    description: "حفظ رسالة وتكرارها",
    commandCategory: "system",
    usages: "محرك رسالة (نص)",
    cooldowns: 0,
    aliases: ["engine"]
  },

  run: async function ({ api, event, args }) {
    const body = (event.body || "").trim();
    const rest = body.replace(/^(محرك|engine)\s*/i, "").trim();
    const threadID = event.threadID;
    const data = loadData();

    if (!data[threadID]) data[threadID] = { text: "", seconds: 0 };

    if (/^رسالة\s+/.test(rest)) {
      const text = rest.replace(/^رسالة\s+/, "").trim();
      data[threadID].text = text;
      saveData(data);
      return api.sendMessage(`💾 تم حفظ الرسالة: "${text}"`, threadID, event.messageID);
    }

    if (/^وقت\s+/.test(rest)) {
      const seconds = parseTime(rest.replace(/^وقت\s+/, "").trim());
      if (!seconds) return api.sendMessage("⚠️ صيغة الوقت خاطئة.", threadID, event.messageID);
      data[threadID].seconds = seconds;
      saveData(data);
      if (timers[threadID]) startTimer(api, threadID, data[threadID].text, seconds);
      return api.sendMessage(`⏱️ تم ضبط الوقت: كل ${seconds} ثانية`, threadID, event.messageID);
    }

    if (rest === "تشغيل") {
      if (!data[threadID].text || !data[threadID].seconds) return api.sendMessage("⚠️ احفظ رسالة ووقت أولاً.", threadID, event.messageID);
      startTimer(api, threadID, data[threadID].text, data[threadID].seconds);
      return api.sendMessage(`✅ تم التشغيل كل ${data[threadID].seconds} ثانية`, threadID, event.messageID);
    }

    if (rest === "ايقاف") {
      stopTimer(threadID);
      return api.sendMessage("🛑 تم الإيقاف.", threadID, event.messageID);
    }
  }
};