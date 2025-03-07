self.addEventListener("push", (event) => {
  console.log("📩 Notificação recebida:", event.data ? event.data.text() : "Sem dados");
  const data = event.data ? event.data.json() : { title: "Notificação", message: "Nova mensagem" };

  event.waitUntil(
      self.registration.showNotification(data.title, {
          body: data.message,
          icon: "/icon.png",
      })
  );
});

