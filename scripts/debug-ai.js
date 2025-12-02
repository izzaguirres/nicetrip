
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Carregar .env.local
const envPath = path.resolve(__dirname, '../.env.local');
let envConfig = {};
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
      envConfig[key] = value;
    }
  });
} catch (e) {}

const apiKey = envConfig.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ Sem API Key.");
  process.exit(1);
}

async function testModels() {
  console.log("🔍 Listando modelos disponíveis...");
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // Tentar conexão direta com gemini-1.5-flash primeiro (mais comum agora)
    console.log("Teste 1: gemini-1.5-flash");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Oi");
        console.log("✅ gemini-1.5-flash: FUNCIONOU!");
        return; // Se funcionou, paramos
    } catch (e) {
        console.log("❌ gemini-1.5-flash falhou:", e.message.split(':')[0]);
    }

    // Tentar gemini-pro
    console.log("Teste 2: gemini-pro");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Oi");
        console.log("✅ gemini-pro: FUNCIONOU!");
        return;
    } catch (e) {
        console.log("❌ gemini-pro falhou:", e.message.split(':')[0]);
    }

  } catch (error) {
    console.error("Erro geral:", error.message);
  }
}

testModels();
