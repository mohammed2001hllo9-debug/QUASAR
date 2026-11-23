module.exports = {
  config: {
    name: "felix",
    aliases: ["فيليكس", "فليكس"],
    version: "1.0.0",
    author: "Shadow",
    role: 0,
    description: "فيليكس يرد على المناداة والأسئلة",
    category: "fun",
    guide: {
      en: "اكتب: فيليكس + سؤالك",
      ar: "اكتب: فيليكس + سؤالك"
    }
  },

  onChat: async function ({ api, event, message }) {
    const body = (event.body || "").trim();
    const lower = body.toLowerCase();

    // كلمات المناداة
    const triggers = ["فيليكس", "فليكس", "felix"];
    const isCalled = triggers.some(t => lower.startsWith(t));

    if (!isCalled) return;

    // استخرج السؤال بعد كلمة المناداة
    let question = body;
    for (const t of triggers) {
      if (lower.startsWith(t)) {
        question = body.slice(t.length).trim();
        break;
      }
    }

    // إذا ناداه فقط بدون سؤال
    if (!question) {
      return api.sendMessage("شتريد", event.threadID, event.messageID);
    }

    // إذا سأله سؤالاً
    const reply = getReply(question);
    return api.sendMessage(reply, event.threadID, event.messageID);
  }
};

// دالة الردود الذكية (قابلة للتوسيع)
function getReply(q) {
  const text = q.toLowerCase();

  if (text.includes("شلونك") || text.includes("كيفك") || text.includes("اخبارك"))
    return "بخير شكراً، شلونك أنت؟";

  if (text.includes("اسمك") || text.includes("منو انت"))
    return "أنا فيليكس 🤖، خادمك في المجموعة";

  if (text.includes("وين") )
    return "موجود هنا، وين أكون؟ 😄";

  if (text.includes("شكرا") || text.includes("مشكور"))
    return "العفو، هذا واجبي 🌹";

  if (text.includes("سلام") || text.includes("هلا") || text.includes("مرحبا"))
    return "هلا بيك، شتريد؟";

  if (text.includes("احبك") || text.includes("أحبك"))
    return "وأنا أحبك أكثر 😄";

  if (text.includes("باي") || text.includes("وداعا"))
    return "باي، لا تنساني 👋";

  // رد افتراضي إذا كان سؤالاً
  if (text.includes("?") || text.includes("؟") || text.includes("شنو") || text.includes("ليش") || text.includes("متى") || text.includes("وين"))
    return "سؤالك حلو، بس ما عندي جواب دقيق لهسه 🤔";

  return "شتريد؟";
}