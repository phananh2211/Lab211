import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../supabaseClient';

export default function MfaVerification({ factorId, onVerifySuccess }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
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
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '30px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center' }}>🛡️ Xác thực MFA</h2>
        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="Nhập mã 6 số" maxLength={6} required style={{ width: '100%', padding: '12px', fontSize: '18px', textAlign: 'center', borderRadius: '8px', border: '1px solid #ccc' }} />
          <button type="submit" disabled={loading} style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px' }}>
            {loading ? 'Đang xác thực...' : 'Xác nhận'}
          </button>
        </form>
      </div>
    </div>
  );
}