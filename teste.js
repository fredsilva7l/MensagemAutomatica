async function carregarMensagens() {
  try {
    const response = await fetch("https://raw.githubusercontent.com/fredsilva7l/ChatBot/main/mensagens.json");
    return await response.json();
  } catch (error) {
    console.log("Erro:", error);
    return [];
  }
}

async function main() {
  console.log("Testando carregamento de mensagens...");
  
  const mensagens = await carregarMensagens();
  console.log(`${mensagens.length} mensagens carregadas`);
  
  const hoje = mensagens.find(msg => msg.data === "09/09/2025");
  if (hoje) {
    console.log("Mensagem de hoje:", hoje.mensagem);
    console.log("Música:", hoje.musica);
    console.log("Link da música:", hoje.link_musica);
  }
}

main().catch(console.error);
