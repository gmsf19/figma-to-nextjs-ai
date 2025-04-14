// utils/testFigmaWebhook.ts
import axios from "axios";

export async function testFigmaWebhook() {
  const webhookUrl = "http://localhost:3000/api/figma-webhook";

  // Simula um evento de atualização de arquivo
  const fileUpdateEvent = {
    event_type: "FILE_UPDATE",
    file_key: "abc123",
    passcode: "your-passcode-if-any",
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await axios.post(webhookUrl, fileUpdateEvent, {
      headers: {
        "x-figma-signature": "sha1=" + "simulated-signature", // Em produção, gere isso corretamente
      },
    });

    console.log("Webhook test response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error testing webhook:", error);
    throw error;
  }
}
