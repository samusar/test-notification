import { NextResponse } from "next/server";
import https from "https";
import crypto from "crypto";

const AZURE_NAMESPACE = process.env.AZURE_NAMESPACE;
const AZURE_HUB_NAME = process.env.AZURE_HUB_NAME;
const AZURE_SAS_KEY_NAME = process.env.AZURE_SAS_KEY_NAME;
const AZURE_SAS_KEY = process.env.AZURE_SAS_KEY;

if (!AZURE_NAMESPACE || !AZURE_HUB_NAME || !AZURE_SAS_KEY_NAME || !AZURE_SAS_KEY) {
    throw new Error("Missing required environment variables");
}

function generateSasToken(): string {
    const resourceUri = `https://${AZURE_NAMESPACE}.servicebus.windows.net/${AZURE_HUB_NAME}`;
    const expiry = Math.floor(new Date().getTime() / 1000) + 3600;
    const stringToSign = encodeURIComponent(resourceUri) + "\n" + expiry;

    if (!AZURE_SAS_KEY) {
        throw new Error("AZURE_SAS_KEY is not defined");
    }
    const hmac = crypto.createHmac("sha256", AZURE_SAS_KEY);
    hmac.update(stringToSign);
    const signature = hmac.digest("base64");

    return `SharedAccessSignature sr=${encodeURIComponent(resourceUri)}&sig=${encodeURIComponent(signature)}&se=${expiry}&skn=${AZURE_SAS_KEY_NAME}`;
}

export async function POST(req: Request) {
    try {
        const { title, message } = await req.json();
        console.log("🚀 Enviando payload:", { title, message });

        const payload = JSON.stringify({ notification: { title, body: message } });

        const options = {
            hostname: `${AZURE_NAMESPACE}.servicebus.windows.net`,
            path: `/${AZURE_HUB_NAME}/messages?api-version=2015-04`,
            method: "POST",
            headers: {
                Authorization: generateSasToken(),
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payload),
            },
        };

        const response = await new Promise((resolve, reject) => {
            const request = https.request(options, (response) => {
                let data = "";
                response.on("data", (chunk) => (data += chunk));
                response.on("end", () => resolve(data));
            });

            request.on("error", (error) => reject(error));

            request.write(payload);
            request.end();
        });

        return NextResponse.json({ message: "Notificação enviada!", response });
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json({ error: "Erro ao processar requisição", details: (error instanceof Error) ? error.message : 'error' }, { status: 500 });
    }
}