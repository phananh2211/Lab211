import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../supabaseClient';

export default function MfaVerification({ factorId, onVerifySuccess }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 chữ số mã OTP!");
      return;
    }
    setLoading(true);
    try {
      const { data: challenge } = await supabase.auth.mfa.challenge({ factorId });
      const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
      if (error) throw error;
      toast.success("🛡️ Xác thực MFA thành công!");
      onVerifySuccess();
    } catch (err) {
      toast.error("Mã OTP không đúng: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '70vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '420px', 
        padding: '40px 32px', 
        backgroundColor: '#ffffff', 
        borderRadius: '24px', 
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
        boxSizing: 'border-box',
        textAlign: 'center'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          backgroundColor: '#eff6ff',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          fontSize: '26px'
        }}>
          🔐
        </div>

        <h2 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '22px', 
          fontWeight: '800', 
          color: '#111827',
          letterSpacing: '-0.025em'
        }}>
          Xác thực bảo mật 2 lớp
        </h2>
        
        <p style={{ 
          margin: '0 0 28px 0', 
          fontSize: '14px', 
          color: '#6b7280',
          lineHeight: '1.5'
        }}>
          Nhập mã OTP gồm 6 chữ số từ ứng dụng <br/>Google Authenticator của bạn.
        </p>

        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <input 
              type="text" 
              value={code} 
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))} 
              placeholder="• • • • • •" 
              maxLength={6} 
              autoFocus
              required 
              style={{ 
                width: '100%', 
                padding: '14px', 
                fontSize: '24px', 
                textAlign: 'center', 
                letterSpacing: '8px', 
                borderRadius: '12px', 
                border: '2px solid #e5e7eb', 
                outline: 'none',
                boxSizing: 'border-box',
                fontWeight: '700',
                color: '#1f2937',
                backgroundColor: '#f9fafb',
                transition: 'all 0.2s ease'
              }} 
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || code.length < 6} 
            style={{ 
              padding: '14px', 
              backgroundColor: code.length === 6 && !loading ? '#2563eb' : '#93c5fd', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: '700',
              fontSize: '15px',
              cursor: code.length === 6 && !loading ? 'pointer' : 'not-allowed',
              boxShadow: code.length === 6 && !loading ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Đang xác thực...' : 'Xác nhận bảo mật'}
          </button>
        </form>

        <div style={{ marginTop: '20px' }}>
          <button 
            type="button" 
            onClick={() => supabase.auth.signOut()} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#ef4444', 
              fontSize: '13px', 
              fontWeight: '600',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            ← Hủy bỏ & Đăng nhập lại
          </button>
        </div>
      </div>
    </div>
  );
}