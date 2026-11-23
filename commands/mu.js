const { spawn } = require("child_process");
const yts       = require("yt-search");
const fs        = require("fs");
const path      = require("path");

const CACHE_DIR = path.join(__dirname, "cache");
const YTDLP     = path.join(process.cwd(), ".pythonlibs", "bin", "yt-dlp");
const MAX_MINS  = 10;

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

function cleanFile(p) {
  try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch {}
}

function secToTime(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function downloadAudio(url, outPath) {
  return new Promise((resolve, reject) => {
    const args = [
      url,
      "--format", "bestaudio/best",
      "--extract-audio",
      "--audio-format", "mp3",
      "--audio-quality", "0",
      "--output", outPath,
      "--no-playlist",
      "--socket-timeout", "30",
      "--retries", "3"
    ];

    const proc = spawn(YTDLP, args);
    let stderr = "";
    proc.stderr.on("data", d => { stderr += d.toString(); });
    proc.on("close", code => {
      const altPath = outPath.endsWith(".mp3") ? outPath : outPath + ".mp3";
      if (code === 0 && (fs.existsSync(outPath) || fs.existsSync(altPath))) {
        resolve(fs.existsSync(outPath) ? outPath : altPath);
      } else {
        reject(new Error(`yt-dlp exited ${code}: ${stderr.slice(-300)}`));
      }
    });
    proc.on("error", reject);
    setTimeout(() => {
      try { proc.kill(); } catch {}
      reject(new Error("Timeout"));
    }, 120000);
  });
}

module.exports = {
  config: {
    name: "mu",
    aliases: ["اغنية", "song"],
    version: "3.0.0",
    author: "Van",
    role: 0,
    description: "بحث وتحميل أغنية من يوتيوب",
    category: "media",
    guide: {
      en: "{pn} [اسم الأغنية]",
      ar: "{pn} [اسم الأغنية]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ").trim();

    if (!query) {
      return api.sendMessage(
        "❌ اكتب اسم الأغنية.\nمثال: mu faded",
        threadID,
        messageID
      );
    }

    let waitMsgID = null;
    try {
      const wi = await new Promise((res, rej) =>
        api.sendMessage(
          `🔍 جاري البحث: ${query}...`,
          threadID,
          (e, i) => (e ? rej(e) : res(i)),
          messageID
        )
      );
      waitMsgID = wi.messageID;
    } catch {}

    let videoURL = "", videoTitle = query, videoDuration = 0, videoChannel = "";

    try {
      const result = await yts(query);
      const videos = (result.videos || []).filter(v => v.seconds > 0 && v.seconds <= MAX_MINS * 60);
      const video  = videos[0] || (result.videos || [])[0];
      if (!video) throw new Error("No results");

      videoURL      = video.url;
      videoTitle    = video.title || query;
      videoChannel  = video.author && video.author.name ? video.author.name : "";
      videoDuration = video.seconds || 0;
    } catch {
      try { if (waitMsgID) api.unsendMessage(waitMsgID); } catch {}
      return api.sendMessage("❌ لم يتم العثور على نتائج.", threadID, messageID);
    }

    if (videoDuration > MAX_MINS * 60) {
      try { if (waitMsgID) api.unsendMessage(waitMsgID); } catch {}
      return api.sendMessage(
        `❌ الأغنية طويلة جداً (${secToTime(videoDuration)}). الحد الأقصى ${MAX_MINS} دقائق.`,
        threadID,
        messageID
      );
    }

    try {
      if (waitMsgID) { api.unsendMessage(waitMsgID); waitMsgID = null; }
      const wi2 = await new Promise((res, rej) =>
        api.sendMessage(
          `⬇️ جاري التحميل: ${videoTitle}`,
          threadID,
          (e, i) => (e ? rej(e) : res(i)),
          messageID
        )
      );
      waitMsgID = wi2.messageID;
    } catch {}

    const tmpBase = path.join(CACHE_DIR, `mu_${Date.now()}.mp3`);
    let finalPath = null;

    try {
      finalPath = await downloadAudio(videoURL, tmpBase);
    } catch (err) {
      try { if (waitMsgID) api.unsendMessage(waitMsgID); } catch {}
      return api.sendMessage(
        `❌ تعذر تحميل الأغنية: "${videoTitle}"\nجرّب اسمًا آخر.`,
        threadID,
        messageID
      );
    }

    try { if (waitMsgID) api.unsendMessage(waitMsgID); } catch {}

    if (!finalPath || !fs.existsSync(finalPath)) {
      cleanFile(tmpBase);
      return api.sendMessage(`❌ الملف لم يُوجد بعد التحميل.`, threadID, messageID);
    }

    try {
      await api.sendMessage(
        {
          body: `🎵 ${videoTitle}\n🎤 ${videoChannel}\n⏱ ${secToTime(videoDuration)}`,
          attachment: [fs.createReadStream(finalPath)]
        },
        threadID,
        messageID
      );
    } catch {
      api.sendMessage("❌ فشل إرسال الملف الصوتي.", threadID, messageID);
    }

    setTimeout(() => cleanFile(finalPath), 15000);
  }
};