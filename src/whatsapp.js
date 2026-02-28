const makeWASocket = require("@whiskeysockets/baileys").default;
const {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const qrcode = require("qrcode-terminal");
const P = require("pino");

const parseMessage = require("./parser");
const appendToSheet = require("./sheets");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: P({ level: "silent" }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({ level: "silent" })),
    },
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n📱 Scan this QR quickly:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ WhatsApp Connected!");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log("❌ Connection closed. Reconnecting:", shouldReconnect);

      if (shouldReconnect) {
        startBot();
      }
    }
  });

sock.ev.on("messages.upsert", async ({ messages }) => {
  const msg = messages[0];
  if (!msg.message) return;

  const remoteJid = msg.key.remoteJid;

  // 1️⃣ Only allow groups
  if (!remoteJid.endsWith("@g.us")) return;

  // 2️⃣ Fetch group metadata
  const metadata = await sock.groupMetadata(remoteJid);

  // 3️⃣ Only allow specific group name
  if (metadata.subject !== "CFO Bot") return;

  // 4️⃣ Ignore bot's own messages
  if (msg.key.fromMe) return;

  const text =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text;

  if (!text) return;

  console.log("📩 CFO Incoming:", text);

  const parsed = parseMessage(text);
  if (!parsed) return;

  await appendToSheet(parsed);

  await sock.sendMessage(remoteJid, {
    text: `✅ ${parsed.type} ${parsed.amount} PKR recorded under ${parsed.category}`,
  });
});
}

startBot();