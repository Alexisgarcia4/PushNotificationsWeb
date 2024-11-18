self.addEventListener('push', (event) => {
    const data = event.data.json();
    console.log('Notificación recibida:', data);

    self.registration.showNotification(data.title, {
        body: data.body,
    });
});
