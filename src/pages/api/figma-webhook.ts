// @typescript-eslint/no-explicit-any
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import crypto from "crypto";

const FIGMA_API_URL = "https://api.figma.com/v1";
const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const WEBHOOK_SECRET = process.env.FIGMA_WEBHOOK_SECRET;

// Configuração do Axios para a API do Figma
const figmaApi = axios.create({
  baseURL: FIGMA_API_URL,
  headers: {
    "X-Figma-Token": FIGMA_TOKEN || "",
  },
});

function verifySignature(rawBody: string, signature: string) {
  const hmac = crypto.createHmac("sha1", WEBHOOK_SECRET || "");
  const digest = hmac.update(rawBody).digest("hex");
  return `sha1=${digest}` === signature;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Validação de assinatura
    const rawBody = JSON.stringify(req.body);
    const signature = req.headers["x-figma-signature"] as string;

    if (!verifySignature(rawBody, signature)) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    const event = req.body;

    // Exemplo: Quando um arquivo é atualizado
    if (event.event_type === "FILE_UPDATE") {
      const fileKey = event.file_key;

      // Usando Axios para buscar detalhes do arquivo atualizado
      const response = await figmaApi.get(`/files/${fileKey}`);
      const fileData: any = response.data;

      console.log("Arquivo atualizado:", fileData.name);

      // Aqui você pode processar os dados do arquivo
      // Exemplo: salvar em um banco de dados ou disparar outras ações
    }

    // Exemplo: Quando um comentário é criado
    if (event.event_type === "COMMENT_CREATE") {
      const comment = event.comment;
      const fileKey = event.file_key;

      console.log(`Novo comentário no arquivo ${fileKey}:`, comment.message);

      // Opcional: Responder ao comentário via API
      await figmaApi.post(`/files/${fileKey}/comments`, {
        message: "Recebemos seu comentário!",
        comment_id: comment.id,
      });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error processing Figma webhook:", error);

    return res.status(500).json({ error: "Internal server error" });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Figma webhooks podem enviar payloads grandes
    },
  },
};
