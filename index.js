const http = require("http");
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const schedule = require("node-schedule");

const PORT = process.env.PORT || 3000;
const SUCCESS_HEADERS = { "Content-Type": "text/plain" };
const SUCCESS_BODY = "online";

const server = http.createServer((req, res) => {
  res.writeHead(200, SUCCESS_HEADERS);
  res.end(SUCCESS_BODY);
});

server.listen(PORT, () => {
  console.log(`Servidor HTTP rodando na porta ${PORT}`);
});

const myNumber = "553173571193@c.us";
const targetNumber = "553173571193@c.us";

let sock;

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log("Conexão fechada, reconectando:", shouldReconnect);

      if (shouldReconnect) connectToWhatsApp();
    }
    if (connection === "open") {
      const jobEnviar = schedule.scheduleJob("0 15 * * *", enviarMensagemDia);

      if (jobEnviar) {
        console.log("Agendamento de envio configurado para 15:00");
      } else {
        console.error("Erro: Falha ao criar o agendamento de envio");
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

async function enviarMensagemDia() {
  const dataAtual = new Date().toLocaleDateString("pt-BR");
  const mensagens = await carregarMensagens();
  const mensagemDoDia = mensagens.find((msg) => msg.data === dataAtual);

  if (!mensagemDoDia) {
    console.log(`Nenhuma mensagem encontrada no dia ${dataAtual}`);
    return;
  }

  console.log(`Enviando (${mensagemDoDia.diaSemana}) para ${targetNumber}`);

  await sock.sendMessage(myNumber, {
    text: "Função Iniciada com sucesso!",
  });
  await new Promise((resolve) => setTimeout(resolve, 10000));
  console.log("Processo iniciado com sucesso!");

  await sock.sendMessage(targetNumber, {
    text: mensagemDoDia.mensagem,
  });
  await new Promise((resolve) => setTimeout(resolve, 10000));
  console.log(`Mensagem de texto enviada: ${mensagemDoDia.mensagem}`);

  await sock.sendMessage(targetNumber, {
    text: mensagemDoDia.musica,
  });
  await new Promise((resolve) => setTimeout(resolve, 10000));
  console.log(`Música enviada: ${mensagemDoDia.musica}`);

  await sock.sendMessage(targetNumber, {
    text: mensagemDoDia.link_musica,
  });
  console.log(`Link da música enviado: ${mensagemDoDia.link_musica}`);
}

async function carregarMensagens() {
  const url =
    "https://raw.githubusercontent.com/fredsilva7l/ChatBot/main/mensagens.json";
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

connectToWhatsApp().catch((error) => {
  console.error("Erro na inicialização:", error);
  process.exit(1);
});
