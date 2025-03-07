"use client";

import { useEffect, useState } from "react";

const vapidPublicEnvKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

export default function Home() {
    const [, setSubscription] = useState<PushSubscription | null>(null);

    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").then((reg) => {
                console.log("✅ Service Worker registrado!", reg);
            });
        }
    }, []);

    const subscribeUser = async () => {
        if (!("serviceWorker" in navigator)) {
            alert("Seu navegador não suporta notificações push.");
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            alert("Você precisa permitir as notificações.");
            return;
        }

        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = `${vapidPublicEnvKey}`; // Pegue no Azure

        const subscriptionData = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        setSubscription(subscriptionData);
        

        // Enviar inscrição para o backend
        await fetch("/api/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subscriptionData),
        });

        alert("Notificações ativadas!");
    };

    const postNotification = async () => {
        if (!("serviceWorker" in navigator)) {
            alert("Seu navegador não suporta notificações push.");
            return;
        }

        await fetch("/api/send-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "Teste", message: "Isso é um teste de notificação." }),
        });
      };

    return (
        <main>
            <h1>Notificações Push com Azure</h1>
            <div className="flex flex-col gap-2">
              <button onClick={postNotification}>Enviar Teste de Notificação</button>
              <button onClick={subscribeUser}>Ativar Notificações</button>
            </div>
        </main>
    );
}

// Função para converter chave VAPID
function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}