// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAxADQIvpmP0X9-HqzyI6n1vzcgzZ9txio",
  authDomain: "lab211-411ea.firebaseapp.com",
  projectId: "lab211-411ea",
  storageBucket: "lab211-411ea.firebasestorage.app",
  messagingSenderId: "314374883526",
  appId: "1:314374883526:web:8cbf87620c377bdc016fc7"
});

const messaging = firebase.messaging();

// Xử lý hiển thị thông báo khi ứng dụng đang ở chế độ ngầm / tắt
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Nhận message ngầm: ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/Icon.png' // Icon hiển thị trên thông báo
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});