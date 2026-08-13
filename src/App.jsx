import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import AdminDashboard from './AdminDashboard';
import LecturerDashboard from './LecturerDashboard';
import StudentDashboard from './StudentDashboard';
import SettingsTab from './components/SettingsTab'; 
import Footer from './components/Footer'; 
import PublicContent from './components/PublicContent'; 
import MfaVerification from './components/MfaVerification'; 
import { Toaster, toast } from 'react-hot-toast';
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

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

const requestNotificationPermission = async (userEmail) => {
  if (!userEmail) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, {
        vapidKey: 'BHGhHG1zJliTBR6Lt-VRyntLhULJQNLst5fJR9Dr7Ml9TKXklP030E2E3SrA93Nrlk_Mp3h3Accpv5huZiKRdfA'
      });
      
      if (currentToken && userEmail) {
        await supabase
          .from('user_devices')
          .upsert({ 
            email: userEmail, 
            fcm_token: currentToken, 
            updated_at: new Date() 
          }, { onConflict: 'email' });
      }
    }
  } catch (error) {
    console.error("Lỗi khi đăng ký nhận Web Push Notification:", error);
  }
};

export default function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const initialView = queryParams.get('view') || 'dashboard';
  const initialAuth = queryParams.get('auth') === 'true';

  const [initialAppLoad, setInitialAppLoad] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(''); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [supervisor, setSupervisor] = useState('');
  
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showAuthBox, setShowAuthBox] = useState(initialAuth);
  const [currentView, setCurrentView] = useState(initialView);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState('');

  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNavigate = (view) => {
    setIsMobileMenuOpen(false);
    if (currentView === view && !showAuthBox) return;
    setIsTransitioning(true);
    window.history.pushState({}, '', view === 'dashboard' ? window.location.pathname : `?view=${view}`);
    setTimeout(() => {
        setCurrentView(view);
        setShowAuthBox(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsTransitioning(false);
    }, 400);
  };

  const handleOpenAuth = () => {
    setIsMobileMenuOpen(false);
    setIsTransitioning(true);
    window.history.pushState({}, '', `?auth=true`);
    setTimeout(() => {
        setCurrentView('dashboard');
        setShowAuthBox(true);
        setIsTransitioning(false);
    }, 400);
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setIsTransitioning(true);
      setTimeout(() => {
          setCurrentView(params.get('view') || 'dashboard');
          setShowAuthBox(params.get('auth') === 'true');
          setIsTransitioning(false);
      }, 300);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (email) {
      const lowerEmail = email.toLowerCase();
      if (lowerEmail.includes('vatlieu') || lowerEmail.includes('gom')) setSupervisor('Lab Vật liệu Gốm & Luyện kim');
      else if (lowerEmail.includes('nano') || lowerEmail.includes('polymer')) setSupervisor('Lab Vật liệu Nano & Polymer');
      else if (lowerEmail.includes('chem') || lowerEmail.includes('hoa') || lowerEmail.includes('anmon')) setSupervisor('Lab Phân tích và Ăn mòn');
      else if (lowerEmail.endsWith('@hust.edu.vn')) setSupervisor('Bộ môn Khoa học và Kỹ thuật Vật liệu');
    }
  }, [email]);

  const retryAsync = async (fn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(res => setTimeout(res, delay));
      }
    }
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        const { data: { session } } = await retryAsync(() => supabase.auth.getSession());
        if (session) {
            const { data: aalData } = await retryAsync(() => supabase.auth.mfa.getAuthenticatorAssuranceLevel());
            if (aalData && aalData.nextLevel === 'aal2' && aalData.currentLevel === 'aal1') {
                const { data: factorsData } = await retryAsync(() => supabase.auth.mfa.listFactors());
                const verifiedFactor = factorsData?.totp?.find(f => f.status === 'verified');
                if (verifiedFactor) {
                    setMfaFactorId(verifiedFactor.id);
                    setMfaRequired(true);
                }
            }
            setSession(session);
            await fetchUserInfoWithRetry(session.user.email);
            requestNotificationPermission(session.user.email);
        }
      } catch (err) {
        console.error("Lỗi khởi tạo phiên:", err);
      } finally {
        setInitialAppLoad(false);
      }
    };
    
    initApp();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const params = new URLSearchParams(window.location.search);
        if (params.get('auth')) {
            params.delete('auth');
            const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }

        try {
          const { data: aalData } = await retryAsync(() => supabase.auth.mfa.getAuthenticatorAssuranceLevel());
          if (aalData && aalData.nextLevel === 'aal2' && aalData.currentLevel === 'aal1') {
            const { data: factorsData } = await retryAsync(() => supabase.auth.mfa.listFactors());
            const verifiedFactor = factorsData?.totp?.find(f => f.status === 'verified');
            if (verifiedFactor) {
              setMfaFactorId(verifiedFactor.id);
              setMfaRequired(true);
            }
          }
          setSession(session);
          await fetchUserInfoWithRetry(session.user.email);
          requestNotificationPermission(session.user.email);
        } catch (err) {
          console.error("Lỗi xác thực sự kiện auth:", err);
        }
      } else {
        setSession(null);
        setUserRole(null);
        setUserName('');
        setAvatarUrl('');
        setNotifications([]);
        setMfaRequired(false);
        const currentUrlView = new URLSearchParams(window.location.search).get('view') || 'dashboard';
        setCurrentView(currentUrlView);
        setShowAuthBox(new URLSearchParams(window.location.search).get('auth') === 'true');
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchUserInfoWithRetry = async (emailAddr) => {
    try {
      const data = await retryAsync(async () => {
        const { data, error } = await supabase
            .from('users')
            .select('role, full_name, avatar_url')
            .eq('email', emailAddr)
            .single();
        if (error) throw error;
        return data;
      });
      
      if (data) {
          setUserRole(data.role);
          setUserName(data.full_name);
          if (data.avatar_url) setAvatarUrl(data.avatar_url);
      }
    } catch (err) {
        setUserRole('Student'); 
    }
  };

  useEffect(() => {
    if (!session?.user?.email) return;

    const userChannel = supabase.channel('realtime-user-profile')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `email=eq.${session.user.email}`
        },
        (payload) => {
          if (payload.new) {
            setUserName(payload.new.full_name || '');
            setAvatarUrl(payload.new.avatar_url || '');
            if (payload.new.role) setUserRole(payload.new.role);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
    };
  }, [session?.user?.email]);

  // 🌟 Lắng nghe thông báo Realtime từ cơ sở dữ liệu
  useEffect(() => {
      if (!session?.user?.email || mfaRequired) return;
      const fetchNotifs = async () => {
          try {
              const { data } = await retryAsync(() => supabase.from('notifications').select('*').eq('user_email', session.user.email).order('created_at', { ascending: false }).limit(20));
              if (data) setNotifications(data);
          } catch (e) {
              console.error("Lỗi tải thông báo:", e);
          }
      };
      fetchNotifs();
      const channel = supabase.channel('realtime-notifs')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_email=eq.${session.user.email}` }, (payload) => {
              setNotifications(prev => {
                  const exists = prev.some(n => n.id === payload.new.id);
                  if (exists) return prev;
                  return [payload.new, ...prev];
              });
          }).subscribe();
      return () => { supabase.removeChannel(channel); };
  }, [session?.user?.email, mfaRequired]);

  const markAsRead = async (id) => {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  // 🌟 Hàm xóa vĩnh viễn thông báo khỏi Database dựa theo ID và email người dùng hiện tại
  const deleteNotification = async (id, e) => {
      if (e) e.stopPropagation();
      const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', id)
          .eq('user_email', session.user.email);

      if (error) {
          toast.error("Không thể xóa thông báo: " + error.message);
          return;
      }
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("Đã xóa thông báo");
  };

  const markAllAsRead = async () => {
      await supabase.from('notifications').update({ is_read: true }).eq('user_email', session.user.email).eq('is_read', false);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    
    if (isSignUp && !agreeTerms) {
      toast.error("Bạn phải đồng ý với điều khoản sử dụng để đăng ký tài khoản!");
      return;
    }

    setIsLoggingIn(true);
    setLoading(true);

    setTimeout(async () => {
      try {
        if (isSignUp) {
          if (!email.endsWith('@hust.edu.vn') && !email.endsWith('@sis.hust.edu.vn')) { 
              toast.error("Bạn phải sử dụng email trường (@sis.hust.edu.vn hoặc @hust.edu.vn)"); 
              setLoading(false); 
              setIsLoggingIn(false);
              return; 
          }
          if (!fullName.trim()) { toast.error("Vui lòng điền Họ và Tên!"); setLoading(false); setIsLoggingIn(false); return; }
          if (!studentId.trim()) { toast.error("Vui lòng nhập Mã số sinh viên (MSSV)!"); setLoading(false); setIsLoggingIn(false); return; }
          if (!supervisor.trim()) { toast.error("Vui lòng điền thông tin Thuộc Lab / Đơn vị!"); setLoading(false); setIsLoggingIn(false); return; }

          const { error } = await retryAsync(() => supabase.auth.signUp({ 
            email, 
            password, 
            options: { 
              data: { 
                full_name: fullName.trim(), 
                student_id: studentId.trim(), 
                phone_number: phone.trim(), 
                supervisor: supervisor.trim() 
              } 
            } 
          }));
          if (error) throw error;

          toast.success("🎉 Đăng ký thành công! Vui lòng kiểm tra email để bấm vào link xác nhận."); 
          setIsSignUp(false); 
          setLoading(false);
          setIsLoggingIn(false);
        } else {
          if (!rememberMe) {
            await supabase.auth.setSession({ access_token: '', refresh_token: '' });
          }

          const authData = await retryAsync(async () => {
            const res = await supabase.auth.signInWithPassword({ email, password });
            if (res.error) throw res.error;
            return res.data;
          });

          const factorsDataObj = await retryAsync(async () => {
            const res = await supabase.auth.mfa.listFactors();
            return res.data;
          });
          
          const verifiedFactor = factorsDataObj?.totp?.find(f => f.status === 'verified');
          
          if (verifiedFactor) {
              setMfaFactorId(verifiedFactor.id);
              setMfaRequired(true);
              toast("Mã OTP đã được gửi đến ứng dụng Authenticator", { icon: '🛡️' });
              setLoading(false);
              setIsLoggingIn(false);
          } else {
              if (authData?.session?.user?.email) {
                  await fetchUserInfoWithRetry(authData.session.user.email);
                  requestNotificationPermission(authData.session.user.email);
              }
              toast.success("Đăng nhập thành công!");
              setLoading(false);
              setIsLoggingIn(false);
          }
        }
      } catch (err) {
        toast.error("Đăng nhập thất bại: " + (err.message || "Kiểm tra lại đường truyền hoặc tài khoản!"));
        setLoading(false);
        setIsLoggingIn(false);
      }
    }, 50);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await retryAsync(() => supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin }));
      if (error) throw error;
      toast.success("Đã gửi hướng dẫn đặt lại mật khẩu! Vui lòng kiểm tra email."); 
      setIsForgotPassword(false); 
    } catch (err) {
      toast.error("Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      toast.error("Vui lòng nhập email trường của bạn vào ô bên trên trước!");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin }
      });
      if (error) throw error;
      toast.success("Đã gửi lại email xác nhận! Vui lòng kiểm tra hộp thư đến hoặc mục Spam.");
    } catch (err) {
      toast.error("Không thể gửi lại email: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '12px 14px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff', color: '#111827' };

  if (initialAppLoad || isLoggingIn) {
      return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', fontFamily: 'system-ui', zIndex: 999999 }}>
              <img 
                  src={`${import.meta.env.BASE_URL}Icon.png`} 
                  alt="Lab 211 Logo" 
                  style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '16px', marginBottom: '20px', animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: '800', letterSpacing: '-0.025em', marginBottom: '8px' }}>
                  HỆ THỐNG QUẢN LÝ LAB 211
              </div>
              <div style={{ color: '#38bdf8', fontSize: '13px', fontWeight: '500', marginBottom: '25px', textAlign: 'center', maxWidth: '380px', padding: '0 20px', lineHeight: '1.5' }}>
                  {isLoggingIn ? "Đang xác thực bảo mật và tải toàn bộ tài nguyên hệ thống..." : "Nền tảng thông minh phục vụ nghiên cứu khoa học và vận hành thiết bị."}
              </div>
              <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <style>{`
                  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                  @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .7; transform: scale(0.95); } }
              `}</style>
          </div>
      );
  }

  if (!session) {
      return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            <style>{`
                html, body, #root { margin: 0 !important; padding: 0 !important; width: 100%; height: 100%; overflow-x: hidden; }
                @keyframes fadeInScale { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                .fade-in-box { animation: fadeInScale 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .top-progress-bar { position: fixed; top: 0; left: 0; height: 3px; background-color: #3b82f6; z-index: 9999; box-shadow: 0 0 10px #3b82f6; transition: width 0.3s ease, opacity 0.3s ease; }
                .page-transition { transition: opacity 0.3s ease; opacity: ${isTransitioning ? '0.6' : '1'}; pointer-events: ${isTransitioning ? 'none' : 'auto'}; }
                @media (max-width: 850px) {
                    .desktop-menu { display: none !important; }
                    .mobile-menu-btn { display: block !important; }
                }
                @media (min-width: 851px) {
                    .desktop-menu { display: flex !important; }
                    .mobile-menu-btn { display: none !important; }
                }
            `}</style>

            <div className="top-progress-bar" style={{ width: isTransitioning ? '70%' : '100%', opacity: isTransitioning ? 1 : 0 }}></div>
            
            <div className="page-transition" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif', position: 'relative', width: '100vw', boxSizing: 'border-box' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, display: 'flex', overflow: 'hidden', backgroundColor: '#000' }}>
                    <img src={`${import.meta.env.BASE_URL}b8888933-aba8-4830-96f8-4df2fad74008.jpg`} alt="Background 1" style={{ flex: 1, width: '50%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', filter: 'blur(3px) brightness(0.9)' }} />
                    <img src={`${import.meta.env.BASE_URL}93c050fd-70d4-4466-b760-6e4c8bfc210e.jpg`} alt="Background 2" style={{ flex: 1, width: '50%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', filter: 'blur(3px) brightness(0.9)' }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.45)' }}></div>
                </div>

                <nav style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '1200px', backgroundColor: 'rgba(31, 41, 55, 0.75)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.3)', boxSizing: 'border-box' }}>
                    <div onClick={() => handleNavigate('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <img src={`${import.meta.env.BASE_URL}211.jpg`} alt="Logo Lab" style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '8px' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '16px', letterSpacing: '-0.025em' }}>Lab 211 <span style={{ color: '#3b82f6', fontWeight: '500', fontSize: '13px' }}>Management</span></span>
                    </div>

                    <div className="desktop-menu" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        {[
                            { id: 'about', label: 'Giới thiệu' },
                            { id: 'faculty', label: 'Giảng viên' },
                            { id: 'research', label: 'Nghiên cứu' },
                            { id: 'projects_info', label: 'Dự án' },
                            { id: 'terms', label: 'Điều khoản sử dụng' },
                            { id: 'privacy', label: 'Chính sách bảo mật' }
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleNavigate(item.id)}
                                style={{ background: 'none', border: 'none', color: currentView === item.id ? '#60a5fa' : '#9ca3af', cursor: 'pointer', fontSize: '13.5px', fontWeight: '600', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.target.style.color = '#ffffff'}
                                onMouseLeave={e => e.target.style.color = currentView === item.id ? '#60a5fa' : '#9ca3af'}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="desktop-menu">
                        <button
                            onClick={handleOpenAuth}
                            style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '8px 18px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.4)', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.target.style.backgroundColor = '#1d4ed8'}
                            onMouseLeave={e => e.target.style.backgroundColor = '#2563eb'}
                        >
                            Đăng nhập hệ thống
                        </button>
                    </div>

                    <button 
                        className="mobile-menu-btn" 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                        style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '24px', cursor: 'pointer', padding: '0 5px' }}
                    >
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>

                    {isMobileMenuOpen && (
                        <div style={{ position: 'absolute', top: '110%', left: 0, width: '100%', backgroundColor: 'rgba(31, 41, 55, 0.95)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', boxSizing: 'border-box' }}>
                            {[
                                { id: 'about', label: 'Giới thiệu' },
                                { id: 'faculty', label: 'Giảng viên' },
                                { id: 'research', label: 'Nghiên cứu' },
                                { id: 'projects_info', label: 'Dự án' },
                                { id: 'terms', label: 'Điều khoản sử dụng' },
                                { id: 'privacy', label: 'Chính sách bảo mật' }
                            ].map(item => (
                                <button
                                    key={`mob-${item.id}`}
                                    onClick={() => handleNavigate(item.id)}
                                    style={{ background: 'none', border: 'none', color: currentView === item.id ? '#60a5fa' : '#e5e7eb', fontSize: '15px', fontWeight: '600', textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', width: '100%', borderRadius: '8px' }}
                                >
                                    {item.label}
                                </button>
                            ))}
                            <button
                                onClick={handleOpenAuth}
                                style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '15px', fontWeight: '700', marginTop: '10px', width: '100%', textAlign: 'center' }}
                            >
                                Đăng nhập hệ thống
                            </button>
                        </div>
                    )}
                </nav>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '110px 20px 60px 20px', boxSizing: 'border-box', position: 'relative', zIndex: 1, width: '100%' }}>
                    {['about', 'faculty', 'research', 'projects_info', 'public_documents', 'terms', 'privacy'].includes(currentView) ? (
                        <div className="fade-in-box" style={{ width: '100%', maxWidth: '800px', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', padding: '30px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)', boxSizing: 'border-box' }}>
                            <PublicContent currentView={currentView} onBack={() => handleNavigate('dashboard')} />
                        </div>
                    ) : showAuthBox ? (
                        <div className="fade-in-box" style={{ width: '100%', maxWidth: '440px', padding: '35px 28px', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(16px)', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.4)', boxSizing: 'border-box', position: 'relative' }}>
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <img src={`${import.meta.env.BASE_URL}211.png`} alt="Logo Trường Vật Liệu" style={{ width: '70px', height: '70px', objectFit: 'contain', marginBottom: '12px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'; }} />
                                <h2 style={{ color: '#111827', margin: '0 0 10px 0', fontSize: '22px', fontWeight: '800', letterSpacing: '-0.3px' }}>{isSignUp ? 'Đăng ký tài khoản Lab' : (isForgotPassword ? 'Khôi phục mật khẩu' : 'Hệ Thống Quản Lý Lab 211')}</h2>
                                {!isSignUp && !isForgotPassword && (
                                    <div style={{ color: '#4b5563', fontSize: '13px', lineHeight: '1.5' }}>Tài khoản hợp lệ:<br/><b style={{ fontWeight: '700', color: '#111827' }}>Sinh viên:</b> <span style={{ color: '#1d4ed8', fontWeight: '600' }}>@sis.hust.edu.vn</span><br/><b style={{ fontWeight: '700', color: '#111827' }}>Giảng viên:</b> <span style={{ color: '#1d4ed8', fontWeight: '600' }}>@hust.edu.vn</span></div>
                                )}
                            </div>

                            {isForgotPassword ? (
                                <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <div><label style={{ fontSize: '13px', fontWeight: '700', color: '#111827', display: 'block', marginBottom: '6px' }}>Email trường: *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@sis.hust.edu.vn" required style={inputStyle} /></div>
                                    <button type="submit" disabled={loading} style={{ padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 6px rgba(37,99,235,0.2)' }}>{loading ? 'Đang gửi...' : 'Gửi yêu cầu khôi phục'}</button>
                                    <button type="button" onClick={() => setIsForgotPassword(false)} style={{ background: 'none', border: 'none', color: '#1d4ed8', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>← Quay lại đăng nhập</button>
                                </form>
                            ) : (
                                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {isSignUp && (
                                        <>
                                            <div><label style={{ fontSize: '13px', fontWeight: '700', color: '#111827', display: 'block', marginBottom: '6px' }}>Họ và tên thật: *</label><input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nguyễn Văn A" required style={inputStyle} /></div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                <div><label style={{ fontSize: '13px', fontWeight: '700', color: '#111827', display: 'block', marginBottom: '6px' }}>MSSV: *</label><input type="text" value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="2021xxxx" required style={inputStyle} /></div>
                                                <div><label style={{ fontSize: '13px', fontWeight: '700', color: '#111827', display: 'block', marginBottom: '6px' }}>Số điện thoại:</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="098..." style={inputStyle} /></div>
                                            </div>
                                            <div><label style={{ fontSize: '13px', fontWeight: '700', color: '#111827', display: 'block', marginBottom: '6px' }}>Thuộc Lab / Đơn vị: *</label><input type="text" value={supervisor} onChange={e => setSupervisor(e.target.value)} placeholder="Nhập tên giảng viên phụ trách lab" required style={inputStyle} /></div>
                                        </>
                                    )}
                                    <div><label style={{ fontSize: '13px', fontWeight: '700', color: '#111827', display: 'block', marginBottom: '6px' }}>Email trường: *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@sis.hust.edu.vn" required style={inputStyle} /></div>
                                    <div><label style={{ fontSize: '13px', fontWeight: '700', color: '#111827', display: 'block', marginBottom: '6px' }}>Mật khẩu: *</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} /></div>
                                    
                                    {isSignUp && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151' }}>
                                            <input 
                                                type="checkbox" 
                                                id="terms" 
                                                checked={agreeTerms} 
                                                onChange={e => setAgreeTerms(e.target.checked)} 
                                                style={{ width: '16px', height: '16px', cursor: 'pointer' }} 
                                            />
                                            <label htmlFor="terms" style={{ cursor: 'pointer' }}>
                                                Tôi đồng ý với{' '}
                                                <span 
                                                    onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} 
                                                    style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'underline' }}
                                                >
                                                    điều khoản sử dụng
                                                </span>
                                            </label>
                                        </div>
                                    )}

                                    {!isSignUp && (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: '#374151' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input 
                                                    type="checkbox" 
                                                    id="remember" 
                                                    checked={rememberMe} 
                                                    onChange={e => setRememberMe(e.target.checked)} 
                                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }} 
                                                />
                                                <label htmlFor="remember" style={{ cursor: 'pointer' }}>Giữ đăng nhập</label>
                                            </div>
                                        </div>
                                    )}

                                    <button type="submit" disabled={loading} style={{ padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', marginTop: '6px', boxShadow: '0 4px 10px rgba(37,99,235,0.3)' }}>{loading ? 'Đang xử lý...' : (isSignUp ? 'Đăng ký tài khoản' : 'Đăng nhập')}</button>
                                    
                                    {!isSignUp && (
                                        <div style={{ textAlign: 'center', marginTop: '2px' }}>
                                            <button 
                                                type="button" 
                                                onClick={handleResendConfirmation} 
                                                disabled={loading}
                                                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '12.5px', fontWeight: '600', textDecoration: 'underline' }}
                                            >
                                                Chưa nhận được email xác nhận? Gửi lại
                                            </button>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
                                        {isSignUp ? (
                                            <button type="button" onClick={() => setIsSignUp(false)} style={{ background: 'none', border: 'none', color: '#1d4ed8', cursor: 'pointer', fontSize: '13px', fontWeight: '700', padding: 0 }}>← Quay lại đăng nhập</button>
                                        ) : (
                                            <>
                                                <button type="button" onClick={() => setIsSignUp(true)} style={{ background: 'none', border: 'none', color: '#1d4ed8', cursor: 'pointer', fontSize: '13px', fontWeight: '700', padding: 0 }}>Đăng ký tài khoản mới</button>
                                                <button type="button" onClick={() => setIsForgotPassword(true)} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: 0 }}>Quên mật khẩu?</button>
                                            </>
                                        )}
                                    </div>
                                </form>
                            )}

                            {showTermsModal && (
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', borderRadius: '24px', zIndex: 50, display: 'flex', flexDirection: 'column', padding: '24px', boxSizing: 'border-box' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                                        <h3 style={{ color: '#ffffff', margin: 0, fontSize: '16px', fontWeight: '700' }}>📜 Điều khoản sử dụng</h3>
                                        <button 
                                            onClick={() => setShowTermsModal(false)}
                                            style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', padding: '0 4px', transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.target.style.color = '#ffffff'}
                                            onMouseLeave={e => e.target.style.color = '#9ca3af'}
                                            title="Đóng"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div style={{ flex: 1, overflowY: 'auto', color: '#d1d5db', fontSize: '13px', lineHeight: '1.6', paddingRight: '5px' }}>
                                        <p><b>1. Quy định về tài khoản định danh:</b> Hệ thống yêu cầu bắt buộc người sử dụng phải đăng ký bằng email chính thức của trường Đại học Bách khoa Hà Nội (@hust.edu.vn hoặc @sis.hust.edu.vn).</p>
                                        <p><b>2. Trách nhiệm bảo mật:</b> Người dùng chịu trách nhiệm tuyệt đối trong việc bảo mật mật khẩu và mã xác thực MFA. Không chia sẻ thông tin tài khoản cho người khác.</p>
                                        <p><b>3. Vận hành thiết bị:</b> Việc đặt lịch thiết bị và đề xuất mua sắm phải tuân thủ nghiêm ngặt nội quy an toàn phòng thí nghiệm tại Phòng 211-C5</p>
                                        <p><b>4. Bảo mật dữ liệu:</b> Thông tin cá nhân và kết quả nghiên cứu được lưu trữ an toàn, cam kết không chia sẻ với bên thứ ba ngoài ban quản lý phòng thí nghiệm.</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowTermsModal(false)}
                                        style={{ marginTop: '15px', padding: '10px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                                    >
                                    Đã hiểu & Đóng
                                    </button>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="fade-in-box" style={{ textAlign: 'center', color: 'white', maxWidth: '600px', padding: '20px' }}>
                            <h1 style={{ fontSize: '38px', fontWeight: '900', marginBottom: '16px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Chào mừng đến với Hệ thống Quản lý Lab 211</h1>
                            <p style={{ fontSize: '16px', color: '#e5e7eb', marginBottom: '28px', lineHeight: '1.6', textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>Nền tảng thông minh phục vụ nghiên cứu khoa học, vận hành thiết bị và quản lý thành viên tại phòng 211 - C5, Đại học Bách khoa Hà Nội.</p>
                            <button
                                onClick={handleOpenAuth}
                                style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', padding: '14px 32px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 25px rgba(37,99,235,0.5)', transition: 'transform 0.2s' }}
                                onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                            >
                                Bắt đầu trải nghiệm ngay →
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ width: '100%', position: 'relative', zIndex: 2, marginTop: 'auto' }}>
                    <Footer onSelectTab={handleNavigate} />
                </div>
            </div>
        </>
      );
  }

  const sessionWithRole = { ...session, role: userRole };

  return (
    <>
        <Toaster position="top-right" reverseOrder={false} />
        
        <style>{`
            html, body, #root { margin: 0; padding: 0; width: 100%; overflow-x: hidden; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .notif-item:hover { background-color: #f8fafc !important; }
            .top-progress-bar { position: fixed; top: 0; left: 0; height: 3px; background-color: #3b82f6; z-index: 9999; box-shadow: 0 0 10px #3b82f6; transition: width 0.3s ease, opacity 0.3s ease; }
            .page-transition { transition: opacity 0.3s ease; opacity: ${isTransitioning ? '0.5' : '1'}; pointer-events: ${isTransitioning ? 'none' : 'auto'}; }
        `}</style>

        <div className="top-progress-bar" style={{ width: isTransitioning ? '70%' : '100%', opacity: isTransitioning ? 1 : 0 }}></div>

        <div className="page-transition" style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', width: '100%' }}>
            
            <div style={{ flex: '1 0 auto', width: '100%', maxWidth: '1200px', margin: '20px auto 0 auto', backgroundColor: 'white', padding: '16px 20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', boxSizing: 'border-box' }}>
                
                {mfaRequired || currentView === 'mfa' ? (
                    <MfaVerification 
                        factorId={mfaFactorId} 
                        onVerifySuccess={() => {
                            setMfaRequired(false);
                            handleNavigate('dashboard');
                        }} 
                    />
                ) : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #f3f4f6', paddingBottom: '16px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', minWidth: 0, flex: 1 }} onClick={() => handleNavigate('dashboard')}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontSize: '16px', fontWeight: 'bold', overflow: 'hidden', border: '1px solid #d1d5db', flexShrink: 0 }}>
                                    {avatarUrl ? <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (userName || session.user.email).charAt(0).toUpperCase()}
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontSize: '15px', color: '#111827', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Xin chào, <span style={{ color: '#2563eb' }}>{userName || session.user.email}</span> </div>
                                    <div style={{ marginTop: '3px' }}><span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold', backgroundColor: userRole === 'Admin' ? '#fee2e2' : (userRole === 'Lecturer' ? '#fef3c7' : '#e0f2fe'), color: userRole === 'Admin' ? '#991b1b' : (userRole === 'Lecturer' ? '#92400e' : '#075985') }}>{userRole === 'Admin' ? 'Quản trị viên' : (userRole === 'Lecturer' ? 'Giảng viên' : 'Sinh viên')}</span></div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <div style={{ position: 'relative' }}>
                                    <button onClick={() => setShowNotif(!showNotif)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '38px', height: '38px', fontSize: '18px', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', flexShrink: 0 }}>🔔{unreadCount > 0 && <span style={{ position: 'absolute', top: '-2px', right: '-4px', backgroundColor: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '1px 5px', borderRadius: '10px', border: '2px solid white' }}>{unreadCount > 9 ? '9+' : unreadCount}</span>}</button>
                                    {showNotif && (
                                        <div style={{ position: 'absolute', top: '48px', right: '0', width: '90vw', maxWidth: '320px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb', zIndex: 1000, overflow: 'hidden', boxSizing: 'border-box' }}>
                                            <div style={{ padding: '12px 14px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb' }}>
                                                <h4 style={{ margin: 0, fontSize: '14px', color: '#111827' }}>Thông báo mới</h4>
                                                {unreadCount > 0 && <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Đã đọc tất cả</button>}
                                            </div>
                                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                {notifications.length === 0 ? (
                                                    <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>Chưa có thông báo nào</div>
                                                ) : notifications.map(n => (
                                                    <div 
                                                        key={n.id} 
                                                        style={{ 
                                                            padding: '10px 14px', 
                                                            borderBottom: '1px solid #f3f4f6', 
                                                            backgroundColor: n.is_read ? 'white' : '#eff6ff', 
                                                            display: 'flex', 
                                                            justifyContent: 'space-between', 
                                                            alignItems: 'flex-start',
                                                            gap: '10px'
                                                        }}
                                                    >
                                                        <div onClick={() => markAsRead(n.id)} style={{ cursor: 'pointer', flex: 1 }}>
                                                            <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#111827', marginBottom: '3px' }}>{n.title}</div>
                                                            <div style={{ fontSize: '12px', color: '#4b5563', lineHeight: '1.4' }}>{n.message}</div>
                                                            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '5px' }}>{new Date(n.created_at).toLocaleString('vi-VN')}</div>
                                                        </div>

                                                        {/* 🌟 Nút Xóa vĩnh viễn thông báo được bảo vệ bằng RLS theo đúng email tài khoản hiện tại */}
                                                        <button 
                                                            onClick={(e) => deleteNotification(n.id, e)}
                                                            style={{ 
                                                                background: 'none', 
                                                                border: 'none', 
                                                                color: '#9ca3af', 
                                                                cursor: 'pointer', 
                                                                fontSize: '14px', 
                                                                fontWeight: 'bold',
                                                                padding: '0 4px',
                                                                borderRadius: '4px'
                                                            }}
                                                            title="Xóa thông báo này"
                                                            onMouseEnter={e => e.target.style.color = '#ef4444'}
                                                            onMouseLeave={e => e.target.style.color = '#9ca3af'}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button onClick={() => handleNavigate(currentView === 'settings' ? 'dashboard' : 'settings')} style={{ background: currentView === 'settings' ? '#2563eb' : '#f3f4f6', color: currentView === 'settings' ? 'white' : 'black', border: 'none', borderRadius: '50%', width: '38px', height: '38px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', flexShrink: '0' }} title="Cài đặt tài khoản & MFA">⚙️</button>
                                <button onClick={() => { supabase.auth.signOut(); toast.success("Đăng xuất"); }} style={{ padding: '8px 12px', cursor: 'pointer', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', borderRadius: '8px', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}><span>Thoát</span> <span>🚪</span></button>
                            </div>
                        </div>

                        {currentView === 'settings' ? (
                            <SettingsTab 
                                session={sessionWithRole} 
                                onUpdateUser={() => fetchUserInfoWithRetry(session.user.email)} 
                            />
                        ) : ['about', 'faculty', 'research', 'projects_info', 'public_documents', 'terms', 'privacy'].includes(currentView) ? ( 
                            <PublicContent currentView={currentView} onBack={() => handleNavigate('dashboard')} />
                        ) : userRole === 'Admin' ? (
                            <AdminDashboard session={sessionWithRole} onNavigate={handleNavigate} /> 
                        ) : userRole === 'Lecturer' ? (
                            <LecturerDashboard session={sessionWithRole} onNavigate={handleNavigate} /> 
                        ) : userRole === 'Student' ? (
                            <StudentDashboard session={sessionWithRole} onNavigate={handleNavigate} /> 
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444', fontSize: '15px', fontWeight: '600', backgroundColor: '#fee2e2', borderRadius: '12px' }}>
                                Tài khoản của bạn chưa được cấp quyền truy cập hợp lệ.
                            </div>
                        )}
                    </>
                )}

            </div>

            <div style={{ width: '100%', flexShrink: '0', marginTop: '40px' }}>
                <Footer onSelectTab={handleNavigate} />
            </div>

        </div>
    </>
  );
}