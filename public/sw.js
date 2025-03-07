self.addEventListener("push", (event) => {
  // Extrai os dados enviados (se houver)
  const data = event.data ? event.data.json() : { title: "Notificação", message: "Nova mensagem" };

  event.waitUntil(
      self.registration.showNotification(data.title, {
          body: data.message,
          icon: "/icon.png",
      })
  );
});

