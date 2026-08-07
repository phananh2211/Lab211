import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import './index.css'
import App from './App.jsx'

// Giao diện hiển thị thân thiện khi ứng dụng gặp sự cố bất ngờ
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'system-ui', backgroundColor: '#f3f4f6', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', maxWidth: '450px', width: '100%' }}>
        <h2 style={{ color: '#dc2626', marginBottom: '10px', fontSize: '20px' }}>⚠️ Đã xảy ra lỗi hệ thống!</h2>
        <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>{error.message}</p>
        <button 
          onClick={resetErrorBoundary} 
          style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
        >
          🔄 Tải lại ứng dụng
        </button>
      </div>
    </div>
  )
}

// Đăng ký Service Worker cho Firebase Web Push Background
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Service Worker registered successfully with scope: ', registration.scope);
      })
      .catch((err) => {
        console.log('Service Worker registration failed: ', err);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)