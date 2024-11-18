import React, { useState, useEffect  } from 'react';



const PushNotifications = () => {

    const [notificacionVisible, setNotificacionVisible] = useState(true);

    const [subscriptionStatus, setSubscriptionStatus] = useState(null);

    const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = atob(base64);
        return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
    };

    const subscribeToPush = async () => {
        if (!('serviceWorker' in navigator)) {
            setSubscriptionStatus('Service Workers no son soportados en este navegador.');
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            setSubscriptionStatus('Permiso denegado para notificaciones.');
            return;
        }

        const registration = await navigator.serviceWorker.register('/service-worker.js');
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array('BOcb233uoLckX3mFgu1AbMfnRZmHYSsW7Zxss8Sqc7qgNG_2RDI98FjReynS1rkqyC-uj83CeYDdVcllONE0MMU'),
        });

        const response = await fetch('http://localhost:3000/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                /*userId: '12345',*/
                subscription,
            }),
        });

        if (response.ok) {
            setSubscriptionStatus('Suscripción exitosa.');

        setNotificacionVisible(false);

        } else {
            setSubscriptionStatus('Error al suscribirse.');
        }


    };

    const checkRegistration = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                const response = await fetch('http://localhost:3000/isRegistered', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ endpoint: subscription.endpoint }),
                });

                const data = await response.json();

                if (data.registered) {
                    setNotificacionVisible(false);
                }
            }
        } catch (error) {
            console.error('Error al verificar la suscripción:', error);
        } 
    };

    useEffect(() => {
        checkRegistration();
    }, []);

    const cancelarNotificacion=()=>setNotificacionVisible(false);



    return (

        <div>
        {notificacionVisible && (
            <div className="position-fixed top-5 start-50 translate-middle bg-white border border-dark rounded shadow p-4 z-3">
                <h3 className="text-center">Notificaciones Push</h3>
                <div className="d-flex justify-content-center gap-3 mt-4">
                    <button className="btn btn-primary" onClick={subscribeToPush}>
                        Habilitar Notificaciones
                    </button>
                    <button className="btn btn-primary" onClick={cancelarNotificacion}>
                        Cancelar
                    </button>
                </div>
                /*{subscriptionStatus && (
                    <div className="alert alert-info mt-3">{subscriptionStatus}</div>
                )}*/
            </div>
        )}
    </div>
        
    );
};

export default PushNotifications;
