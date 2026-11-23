module.exports = {
  config: {
    name: "felix",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Shadow",
    description: "فيليكس يرد على المناداة والأسئلة",
    commandCategory: "fun",
    usages: "",
    cooldowns: 0,
    aliases: ["فيليكس", "فليكس"]
  },

  run: async function ({ api, event }) {
    // هذا الأمر يعمل بـ onStart/run، سنستخدم run
    const body = (event.body || "").trim();
    const lower = body.toLowerCase();
    const triggers = ["فيليكس", "فليكس", "felix"];
    const isCalled = triggers.some(t => lower.startsWith(t));

    if (!isCalled) return;

    let question = body;
    for (const t of triggers) {
      if (lower.startsWith(t)) {
        question = body.slice(t.length).trim();
        break;
      }
    }

    if (!question) {
      return api.sendMessage("شتريد", event.threadID, event.messageID);
    }

    const reply = getReply(question);
    return api.sendMessage(reply, event.threadID, event.messageID);
  }
};

function getReply(q) {
  const text = q.toLowerCase();
  if (text.includes("شلونك") || text.includes("كيفك")) return "بخير شكراً، شلونك أنت؟";
  if (text.includes("اسمك") || text.includes("منو انت")) return "أنا فيليكس 🤖، خادمك في المجموعة";
  if (text.includes("شكرا") || text.includes("مشكور")) return "العفو، هذا واجبي 🌹";
  if (text.includes("سلام") || text.includes("هلا")) return "هلا بيك، شتريد؟";
  if (text.includes("احبك") || text.includes("أحبك")) return "وأنا أحبك أكثر 😄";
  return "شتريد؟";
}
