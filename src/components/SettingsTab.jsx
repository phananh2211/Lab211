import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import bcrypt from 'bcryptjs';
import { BANK_LIST } from './bankList';

export default function SettingsTab({ session, onUpdateUser }) {
  const currentUser = session?.user?.email;
  const [loading, setLoading] = useState(false);

  // State chống spam: Lưu thời gian thực hiện thao tác gần nhất (Cooldown 5 giây)
  const [lastActionTime, setLastActionTime] = useState(0);

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [studentId, setStudentId] = useState(''); 
  const [supervisor, setSupervisor] = useState(''); 
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);

  // State cho Thông tin ngân hàng nhận giải ngân
  const [bankCode, setBankCode] = useState('vcb'); 
  const [bankAccount, setBankAccount] = useState('');

  // Password Form State
  const [isRequestingPasswordReset, setIsRequestingPasswordReset] = useState(false);

  // MFA State
  const [mfaSetup, setMfaSetup] = useState(null); 
  const [verifyCode, setVerifyCode] = useState('');
  const [activeFactorId, setActiveFactorId] = useState(null);

  // PIN Code State
  const [pinCode, setPinCode] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
      fetchMfaFactors();
    }
  }, [currentUser]);

  const fetchUserProfile = async () => {
    const { data } = await supabase
      .from('users')
      .select('full_name, phone_number, student_id, supervisor, avatar_url, pin_code, bank_code, bank_account')
      .eq('email', currentUser)
      .single();

    if (data) {
      setFullName(data.full_name || '');
      setPhoneNumber(data.phone_number || '');
      setStudentId(data.student_id || '');
      setSupervisor(data.supervisor || '');
      setAvatarUrl(data.avatar_url || '');
      setPinCode(data.pin_code || 'Chưa thiết lập mã PIN'); 
      setBankCode(data.bank_code || 'vcb');
      setBankAccount(data.bank_account || '');
    }
  };

  const fetchMfaFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (!error && data) {
        const verifiedFactor = data.all.find(f => f.factor_type === 'totp' && f.status === 'verified');
        if (verifiedFactor) {
          setActiveFactorId(verifiedFactor.id);
        } else {
          setActiveFactorId(null);
        }
      }
    } catch (err) {
      console.error("Lỗi tải trạng thái MFA:", err);
    }
  };

  const checkRateLimit = () => {
    const now = Date.now();
    const cooldownTime = 5000; 
    if (now - lastActionTime < cooldownTime) {
      const remainingSeconds = Math.ceil((cooldownTime - (now - lastActionTime)) / 1000);
      toast.error(`⚠️ Bạn thao tác quá nhanh! Vui lòng đợi ${remainingSeconds} giây nữa trước khi tiếp tục.`);
      return false;
    }
    return true;
  };

  // 1. Cập nhật Thông tin cá nhân, MSSV, Lab hướng dẫn, Ngân hàng & Avatar
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!checkRateLimit()) return;

    if (bankAccount.trim()) {
      const cleanAccount = bankAccount.trim();
      if (!/^\d{6,20}$/.test(cleanAccount)) {
        toast.error("❌ Số tài khoản ngân hàng không hợp lệ (phải từ 6 đến 20 chữ số)!");
        return;
      }
    }

    setLoading(true);
    try {
      let finalAvatarUrl = avatarUrl;

      if (avatarFile) {
        if (avatarUrl) {
          toast.error("Vui lòng bấm nút 'Xóa ảnh hiện tại' để gỡ ảnh cũ trước khi tải lên ảnh đại diện mới!");
          setLoading(false);
          return;
        }

        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${currentUser.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicURLData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        finalAvatarUrl = publicURLData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          student_id: studentId,
          phone_number: phoneNumber,
          supervisor: supervisor,
          avatar_url: finalAvatarUrl,
          bank_code: bankCode,
          bank_account: bankAccount.trim()
        })
        .eq('email', currentUser);

      if (updateError) throw updateError;

      setAvatarUrl(finalAvatarUrl);
      setAvatarFile(null);
      setLastActionTime(Date.now());
      toast.success("✅ Cập nhật thông tin hồ sơ và tài khoản ngân hàng thành công!");

      if (onUpdateUser) {
        onUpdateUser();
      }
    } catch (err) {
      toast.error("Lỗi cập nhật: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!checkRateLimit()) return;

    Swal.fire({
      title: 'Xóa ảnh đại diện?',
      text: 'Ảnh đại diện của bạn sẽ bị gỡ bỏ. Sau khi xóa, bạn mới có thể tải lên ảnh đại diện mới.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Xóa ảnh',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          if (avatarUrl && avatarUrl.includes('/storage/v1/object/public/avatars/')) {
            const urlParts = avatarUrl.split('/storage/v1/object/public/avatars/');
            if (urlParts.length > 1) {
              const oldFilePath = decodeURIComponent(urlParts[1].split('?')[0]);
              if (oldFilePath) {
                const { error: removeError } = await supabase.storage.from('avatars').remove([oldFilePath]);
                if (removeError) console.error("Lỗi xóa file trên storage:", removeError);
              }
            }
          }

          const { error: updateError } = await supabase
            .from('users')
            .update({ avatar_url: '' })
            .eq('email', currentUser);

          if (updateError) throw updateError;

          setAvatarUrl('');
          setAvatarFile(null);
          setLastActionTime(Date.now());
          toast.success("🗑️ Đã xóa ảnh đại diện thành công! Bây giờ bạn có thể chọn ảnh mới.");

          if (onUpdateUser) {
            onUpdateUser();
          }
        } catch (err) {
          toast.error("Lỗi khi xóa ảnh: " + err.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleRequestPasswordResetEmail = async (e) => {
    e.preventDefault();
    if (!checkRateLimit()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(currentUser, {
        redirectTo: window.location.origin
      });
      if (error) throw error;

      setLastActionTime(Date.now());
      toast.success("📩 Đã gửi email xác nhận đổi mật khẩu! Vui lòng kiểm tra hộp thư của bạn.");
    } catch (err) {
      toast.error("Lỗi gửi email: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePin = async (e) => {
    e.preventDefault();
    if (!checkRateLimit()) return;

    if (!pinCode || pinCode.length !== 4 || isNaN(pinCode)) {
      return toast.error("Mã PIN phải bao gồm đúng 4 chữ số!");
    }

    setLoading(true);
    try {
      const salt = bcrypt.genSaltSync(10);
      const hashedPin = bcrypt.hashSync(pinCode, salt);

      const { error } = await supabase
        .from('users')
        .update({ pin_code: hashedPin })
        .eq('email', currentUser);

      if (error) throw error;
      setLastActionTime(Date.now());
      toast.success("🔐 Đã mã hóa và cập nhật mã PIN bảo vệ lịch thành công!");
      fetchUserProfile();
    } catch (err) {
      toast.error("Lỗi lưu mã PIN: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPinWithPassword = async () => {
    if (!checkRateLimit()) return;

    const { value: formValues } = await Swal.fire({
      title: 'Đặt lại mã PIN mới',
      html: `
        <p style="font-size: 13px; color: #6b7280; margin-bottom: 15px; text-align: left;">Vì mã PIN được mã hóa bảo mật nên không thể xem lại. Vui lòng nhập mật khẩu tài khoản của bạn để xác thực:</p>
        <input id="swal-password" type="password" class="swal2-input" placeholder="Mật khẩu tài khoản" style="width: 85%; box-sizing: border-box; margin: 0 0 10px 0;">
        <input id="swal-new-pin" type="password" maxlength="4" class="swal2-input" placeholder="Mã PIN mới (4 chữ số)" style="width: 85%; box-sizing: border-box; letter-spacing: 4px; text-align: center; margin: 0;">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Đổi mã PIN',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#2563eb',
      preConfirm: () => {
        const password = document.getElementById('swal-password').value;
        const newPin = document.getElementById('swal-new-pin').value;
        if (!password || !newPin || newPin.length !== 4 || isNaN(newPin)) {
          Swal.showValidationMessage('Vui lòng nhập mật khẩu và mã PIN mới gồm đúng 4 chữ số!');
          return false;
        }
        return { password, newPin };
      }
    });

    if (formValues) {
      const { password, newPin } = formValues;
      setLoading(true);
      try {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: currentUser,
          password: password
        });

        if (signInErr) throw new Error("Mật khẩu tài khoản không chính xác!");

        const salt = bcrypt.genSaltSync(10);
        const hashedPin = bcrypt.hashSync(newPin, salt);

        const { error: updateErr } = await supabase
          .from('users')
          .update({ pin_code: hashedPin })
          .eq('email', currentUser);

        if (updateErr) throw updateErr;

        setLastActionTime(Date.now());
        toast.success("🔐 Đã đặt lại mã PIN mới thành công!");
        fetchUserProfile();
      } catch (err) {
        toast.error("Lỗi đặt lại PIN: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEnrollMfa = async () => {
    if (!checkRateLimit()) return;
    setLoading(true);
    try {
      const { data: listData } = await supabase.auth.mfa.listFactors();
      if (listData && listData.all) {
        for (const factor of listData.all) {
          if (factor.status === 'unverified') {
            await supabase.auth.mfa.unenroll({ factorId: factor.id });
          }
        }
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'HUST Lab System',
        friendlyName: currentUser
      });
      if (error) throw error;

      const qrCodeDataUrl = data.totp?.qr_code || data.qr_code;
      
      setMfaSetup({
        id: data.id,
        qrCode: qrCodeDataUrl
      });
      setLastActionTime(Date.now());
      toast.success("Vui lòng quét mã QR bằng ứng dụng Authenticator.");
    } catch (err) {
      toast.error("Lỗi thiết lập MFA: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async (e) => {
    e.preventDefault();
    if (!mfaSetup) return;
    setLoading(true);

    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaSetup.id
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaSetup.id,
        challengeId: challengeData.id,
        code: verifyCode
      });
      if (verifyError) throw verifyError;

      // Làm mới phiên đăng nhập để Supabase cấp lại Token mức AAL2
      await supabase.auth.refreshSession();

      toast.success("🛡️ Kích hoạt MFA thành công!");
      setMfaSetup(null);
      setVerifyCode('');
      fetchMfaFactors();

      if (onUpdateUser) {
        onUpdateUser();
      }
    } catch (err) {
      toast.error("Mã xác thực không đúng hoặc đã hết hạn: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnenrollMfa = async (factorId) => {
    Swal.fire({
      title: 'Tắt xác thực đa yếu tố (MFA)?',
      text: 'Tài khoản của bạn sẽ giảm độ bảo mật.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Tắt MFA',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { error } = await supabase.auth.mfa.unenroll({ factorId });
          if (error) throw error;

          toast.success("Đã tắt MFA.");
          setActiveFactorId(null);
          setMfaSetup(null);
          fetchMfaFactors();
        } catch (err) {
          toast.error("Lỗi khi tắt MFA: " + err.message);
        }
      }
    });
  };

  // Lấy thông tin logo của ngân hàng hiện tại đang chọn
  const currentBankObj = BANK_LIST.find(b => b.code === bankCode);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* SECTION 1: HỒ SƠ & AVATAR */}
      <div style={{ marginBottom: '35px' }}>
        <h3 style={{ color: '#374151', fontSize: '16px', marginBottom: '15px' }}>👤 Thông tin cá nhân & Ảnh đại diện</h3>
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e5e7eb', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px solid #d1d5db', flexShrink: 0 }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '28px', color: '#9ca3af' }}>👤</span>
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>
                {avatarUrl ? "⚠️ Bạn cần XÓA ẢNH HIỆN TẠI trước khi muốn thay đổi ảnh mới:" : "Chọn ảnh đại diện mới:"}
              </label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  disabled={Boolean(avatarUrl)}
                  onChange={e => setAvatarFile(e.target.files[0])} 
                  style={{ fontSize: '13px', opacity: avatarUrl ? 0.5 : 1, cursor: avatarUrl ? 'not-allowed' : 'pointer' }}
                />
                {avatarUrl && (
                  <button 
                    type="button" 
                    onClick={handleRemoveAvatar}
                    disabled={loading}
                    style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                  >
                    🗑️ Xóa ảnh hiện tại
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Họ và tên:</label>
              <input 
                type="text" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} 
              />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Số điện thoại:</label>
              <input 
                type="text" 
                value={phoneNumber} 
                onChange={e => setPhoneNumber(e.target.value)} 
                placeholder="VD: 0912345678" 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Mã số sinh viên (MSSV):</label>
              <input 
                type="text" 
                value={studentId} 
                onChange={e => setStudentId(e.target.value)} 
                placeholder="VD: 20231234" 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} 
              />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Lab / Thầy cô hướng dẫn:</label>
              <input 
                type="text" 
                value={supervisor} 
                onChange={e => setSupervisor(e.target.value)} 
                placeholder="VD: Lab Vật liệu Gốm & Luyện kim" 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} 
              />
            </div>
          </div>

          {/* 🌟 SECTION THÔNG TIN NGÂN HÀNG KÈM HIỂN THỊ ICON LOGO */}
          <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', color: '#1e293b' }}>💳 Thông tin tài khoản ngân hàng nhận giải ngân</h4>
              {currentBankObj?.logo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <img src={currentBankObj.logo} alt="Bank Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#334151' }}>{currentBankObj.code.toUpperCase()}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '12px', display: 'block', marginBottom: '5px' }}>Ngân hàng (chuẩn NAPAS):</label>
                <select 
                  value={bankCode} 
                  onChange={e => setBankCode(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', boxSizing: 'border-box', fontSize: '13px' }}
                >
                  {BANK_LIST.map(b => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '12px', display: 'block', marginBottom: '5px' }}>Số tài khoản nhận tiền:</label>
                <input 
                  type="text" 
                  value={bankAccount} 
                  onChange={e => setBankAccount(e.target.value)} 
                  placeholder="VD: 0123456789" 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', backgroundColor: 'white', fontSize: '13px' }} 
                />
              </div>
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '8px' }}>
              ℹ️ Lưu thông tin tài khoản ngân hàng chuẩn xác để giảng viên quét mã QR giải ngân tiền mua vật tư.
            </span>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Email (Không thể thay đổi):</label>
            <input 
              type="email" 
              value={currentUser} 
              disabled 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#6b7280', boxSizing: 'border-box' }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-start', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi hồ sơ'}
          </button>
        </form>
      </div>

      <hr style={{ border: '0', borderTop: '1px solid #e5e7eb', margin: '30px 0' }} />

      {/* SECTION 2: ĐỔI MẬT KHẨU QUA EMAIL XÁC NHẬN */}
      <div style={{ marginBottom: '35px' }}>
        <h3 style={{ color: '#374151', fontSize: '16px', marginBottom: '10px' }}>🔒 Đổi Mật khẩu</h3>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '15px' }}>
          Để đảm bảo an toàn, hệ thống sẽ gửi một đường dẫn xác nhận qua email trường của bạn để tiến hành đổi mật khẩu.
        </p>
        <form onSubmit={handleRequestPasswordResetEmail}>
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '10px 20px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? 'Đang gửi...' : '📩 Gửi email yêu cầu đổi mật khẩu'}
          </button>
        </form>
      </div>

      <hr style={{ border: '0', borderTop: '1px solid #e5e7eb', margin: '30px 0' }} />

      {/* SECTION 3: BẬT MFA (TOTP) */}
      <div style={{ marginBottom: '35px' }}>
        <h3 style={{ color: '#374151', fontSize: '16px', marginBottom: '10px' }}>🛡️ Xác thực đa yếu tố (MFA / Authenticator)</h3>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '15px' }}>
          Tăng cường bảo mật tài khoản bằng ứng dụng Google Authenticator hoặc Authy trên điện thoại của bạn.
        </p>

        {activeFactorId ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#d1fae5', padding: '15px', borderRadius: '8px' }}>
            <span style={{ color: '#065f46', fontWeight: 'bold' }}>✅ Tài khoản đã được bảo vệ bằng MFA.</span>
            <button 
              onClick={() => handleUnenrollMfa(activeFactorId)}
              style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
            >
              Tắt MFA
            </button>
          </div>
        ) : mfaSetup ? (
          <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', textAlign: 'center' }}>Quét mã QR bên dưới bằng Google Authenticator:</p>
            
            {mfaSetup.qrCode ? (
              <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'center' }}>
                <img src={mfaSetup.qrCode} alt="MFA QR Code" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
              </div>
            ) : (
              <p style={{ color: '#dc3545', fontSize: '13px' }}>Không thể tải mã QR. Vui lòng thử lại.</p>
            )}
            
            <form onSubmit={handleVerifyMfa} style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '350px' }}>
              <input 
                type="text" 
                value={verifyCode} 
                onChange={e => setVerifyCode(e.target.value)} 
                placeholder="Nhập mã 6 số từ app" 
                maxLength={6}
                required 
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', textAlign: 'center', letterSpacing: '3px', fontWeight: 'bold' }} 
              />
              <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Xác nhận
              </button>
            </form>
          </div>
        ) : (
          <button 
            onClick={handleEnrollMfa}
            disabled={loading}
            style={{ padding: '10px 20px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? 'Đang tạo...' : '+ Thiết lập MFA ngay'}
          </button>
        )}
      </div>

      <hr style={{ border: '0', borderTop: '1px solid #e5e7eb', margin: '30px 0' }} />

      {/* SECTION 4: CÀI ĐẶT MÃ PIN BẢO VỆ LỊCH */}
      <div>
        <h3 style={{ color: '#374151', fontSize: '16px', marginBottom: '10px' }}>🔑 Mã PIN bảo vệ lịch (4 chữ số)</h3>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '15px' }}>
          Dùng để xác thực khi bạn muốn hủy lịch đăng ký thiết bị. Chuỗi mã hóa (hash) hiện tại của bạn trong cơ sở dữ liệu:
        </p>
        <form onSubmit={handleSavePin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
          <div>
            <input 
              type="text" 
              value={pinCode} 
              readOnly
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#6b7280', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'monospace', textAlign: 'center' }} 
            />
            <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginTop: '4px' }}>* Để thay đổi mã PIN mới, vui lòng dùng tính năng "Quên mã PIN?" ở bên dưới.</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              onClick={handleResetPinWithPassword}
              style={{ width: '100%', padding: '10px 15px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
            >
              🔄 Đổi hoặc Cấp lại mã PIN mới
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}