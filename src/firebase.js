// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { supabase } from "./supabaseClient";

const firebaseConfig = {
  apiKey: "AIzaSyAxADQIvpmP0X9-HqzyI6n1vzcgzZ9txio",
  authDomain: "lab211-411ea.firebaseapp.com",
  projectId: "lab211-411ea",
  storageBucket: "lab211-411ea.firebasestorage.app",
  messagingSenderId: "314374883526",
  appId: "1:314374883526:web:8cbf87620c377bdc016fc7"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Hàm xin quyền và lấy FCM Token lưu vào Database
export const requestForToken = async (userEmail) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY_FROM_FIREBASE'
      });
      
      if (currentToken) {
        // Lưu FCM Token này vào một bảng riêng hoặc bảng users trong Supabase theo userEmail
        await supabase
          .from('user_devices')
          .upsert({ email: userEmail, fcm_token: currentToken }, { onConflict: 'email' });
        
        console.log('FCM Token đăng ký thành công:', currentToken);
      } else {
        console.log('Không lấy được Registration Token.');
      }
    } else {
      console.log('Người dùng từ chối cấp quyền thông báo.');
    }
  } catch (err) {
    console.error('Lỗi khi lấy token thông báo:', err);
  }
};

// Lắng nghe thông báo khi website đang mở (Foreground)
onMessage(messaging, (payload) => {
  console.log('Nhận thông báo khi đang mở web: ', payload);
  // Có thể dùng thư viện react-hot-toast để hiển thị popup tại đây
});