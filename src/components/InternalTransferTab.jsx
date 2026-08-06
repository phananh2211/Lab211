import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import Select from 'react-select';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function InternalTransferTab({ session }) {
  const [usersList, setUsersList] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab navigation states inside the component: 'transfer' | 'guide'
  const [activeSubTab, setActiveSubTab] = useState('transfer');

  // Form states
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [qrUrl, setQrUrl] = useState('');
  const [showQr, setShowQr] = useState(false); // 🌟 State kiểm soát ẩn/hiện mã QR cho đến khi bấm tạo yêu cầu
  const [activeTransferId, setActiveTransferId] = useState(null);

  const currentUserEmail = session?.user?.email;
  
  // Định nghĩa tài khoản Owner (Quản trị viên tối cao xem được toàn bộ)
  const SUPREME_OWNER_EMAIL = 'anh.p237957@sis.hust.edu.vn';
  const isOwner = currentUserEmail === SUPREME_OWNER_EMAIL;

  // 🌟 Tự động hiển thị Pop-up hướng dẫn an toàn
  useEffect(() => {
    Swal.fire({
      title: '🛡️ Hướng dẫn Giao dịch An toàn',
      html: `
        <div style="text-align: left; font-size: 13.5px; lineHeight: 1.6; color: #334151;">
          <p style="margin-bottom: 10px;"><b>1. Không phụ thuộc vào nút bấm:</b> Người nhận tuyệt đối không bấm nút "Đã nhận tiền" dựa vào thông báo hệ thống, mà phải mở app ngân hàng kiểm tra biến động số dư thực tế.</p>
          <p style="margin-bottom: 10px;"><b>2. Đối soát biên lai:</b> Khi chuyển khoản, hãy tải lên ảnh chụp màn hình biên lai thành công để làm bằng chứng đối chiếu chống gian lận 2 chiều.</p>
          <p style="margin-bottom: 10px;"><b>3. Lịch sử giao dịch:</b> Người gửi, người nhận và Admin đều có thể theo dõi lịch sử các giao dịch liên quan đến mình.</p>
          <p style="margin: 0;"><b>4. Xóa giao dịch:</b> Người chuyển có thể xóa giao dịch của mình miễn là giao dịch đó chưa hoàn thành (chưa Confirmed).</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Đã hiểu & Bắt đầu',
      confirmButtonColor: '#2563eb'
    });
  }, []);

  // 1. Lấy danh sách thành viên trong Lab
  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('email, full_name, avatar_url, bank_code, bank_account')
      .neq('email', currentUserEmail);
    if (!error && data) {
      setUsersList(data);
    }
  }, [currentUserEmail]);

  // 2. Lấy lịch sử giao dịch: Owner thấy hết, thành viên khác chỉ thấy giao dịch liên quan đến họ (Gửi hoặc Nhận)
  const fetchTransfers = useCallback(async () => {
    if (!currentUserEmail) return;
    try {
      setLoading(true);
      
      const startOfThisMonth = new Date();
      startOfThisMonth.setDate(1);
      startOfThisMonth.setHours(0, 0, 0, 0);

      let query = supabase
        .from('internal_transfers')
        .select(`
          *,
          sender:users!internal_transfers_sender_email_fkey(full_name, avatar_url),
          recipient:users!internal_transfers_recipient_email_fkey(full_name, avatar_url)
        `)
        .gte('created_at', startOfThisMonth.toISOString());

      // Nếu không phải Owner thì chỉ lọc các giao dịch mà user hiện tại là người gửi hoặc người nhận
      if (!isOwner) {
        query = query.or(`sender_email.eq.${currentUserEmail},recipient_email.eq.${currentUserEmail}`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setTransfers(data);
    } catch (err) {
      console.error("Lỗi tải lịch sử giao dịch:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUserEmail, isOwner]);

  useEffect(() => {
    if (currentUserEmail) {
      fetchUsers();
      fetchTransfers();
    }

    const channel = supabase.channel('realtime-internal-transfers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'internal_transfers' }, () => {
        fetchTransfers();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserEmail, fetchUsers, fetchTransfers]);

  const recipientOptions = usersList.map(u => {
    const hasBankInfo = u.bank_code && u.bank_account;
    return {
      value: u.email,
      label: u.full_name,
      avatar: u.avatar_url,
      email: u.email,
      bank_code: u.bank_code,
      bank_account: u.bank_account,
      isDisabled: !hasBankInfo,
      customLabel: `${u.full_name} ${!hasBankInfo ? '(⚠️ Chưa cập nhật STK)' : ''}`
    };
  });

  const customSelectStyles = {
    option: (provided, state) => ({
      ...provided,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      backgroundColor: state.isFocused ? '#eff6ff' : 'white',
      color: state.data.isDisabled ? '#9ca3af' : '#1f2937',
      cursor: state.data.isDisabled ? 'not-allowed' : 'pointer'
    }),
    singleValue: (provided) => ({
      ...provided,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    })
  };

  const handleSelectRecipient = (opt) => {
    if (opt && (!opt.bank_account || !opt.bank_code)) {
      toast.error(`Thành viên ${opt.label} chưa điền Số tài khoản & Ngân hàng nên không thể nhận chuyển khoản!`);
    }
    setSelectedRecipient(opt);
    setShowQr(false); // Ẩn QR cũ nếu đổi người nhận
  };

  // 4. Tạo giao dịch mới và chỉ hiển thị QR khi bấm nút này
  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    if (!selectedRecipient) return toast.error("Vui lòng chọn người nhận!");
    if (!selectedRecipient.bank_account || !selectedRecipient.bank_code) {
      return toast.error("Người nhận này chưa cập nhật thông tin tài khoản ngân hàng!");
    }
    if (!amount || amount <= 0) return toast.error("Vui lòng nhập số tiền hợp lệ!");

    try {
      let receiptUrl = '';
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `receipt_${currentUserEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${fileExt}`;
        
        const { error: uploadErr } = await supabase.storage
          .from('receipt')
          .upload(fileName, receiptFile, { upsert: true });

        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage
          .from('receipt')
          .getPublicUrl(fileName);
        
        receiptUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase.from('internal_transfers').insert({
        sender_email: currentUserEmail,
        recipient_email: selectedRecipient.email,
        amount: parseFloat(amount),
        message: message.trim() + (receiptUrl ? ` | [Biên lai: ${receiptUrl}]` : ''),
        status: 'Pending'
      }).select().single();

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_email: selectedRecipient.email,
        title: '💸 Yêu cầu chuyển khoản mới',
        message: `Bạn nhận được yêu cầu chuyển ${Number(amount).toLocaleString('vi-VN')} đ từ ${currentUserEmail}. Nội dung: "${message || 'Nonh có'}"`
      });

      // 🌟 Sinh URL mã QR VietQR chuẩn sau khi tạo yêu cầu thành công
      const encodedName = encodeURIComponent(selectedRecipient.label.toUpperCase());
      const encodedInfo = encodeURIComponent(message || `Chuyen tien noi bo`);
      const generatedUrl = `https://img.vietqr.io/image/${selectedRecipient.bank_code}-${selectedRecipient.bank_account}-compact2.png?amount=${amount}&addInfo=${encodedInfo}&accountName=${encodedName}`;
      
      setQrUrl(generatedUrl);
      setShowQr(true); // Kích hoạt hiển thị QR
      setActiveTransferId(data.id);
      
      toast.success("Đã tạo yêu cầu giao dịch thành công! Hãy quét mã QR thanh toán.");
      fetchTransfers();
    } catch (err) {
      toast.error("Lỗi tạo giao dịch: " + err.message);
    }
  };

  const handleMarkAsPaid = async (transferId, recipientEmail) => {
    try {
      const { error } = await supabase
        .from('internal_transfers')
        .update({ status: 'Paid' })
        .eq('id', transferId);

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_email: recipientEmail,
        title: '✅ Đã thanh toán chuyển khoản',
        message: `Người gửi thông báo đã chuyển khoản xong. Vui lòng kiểm tra biến động số dư tài khoản.`
      });

      toast.success("Đã đánh dấu là Đã thanh toán (Paid)!");
      fetchTransfers();
    } catch (err) {
      toast.error("Lỗi cập nhật: " + err.message);
    }
  };

  const handleUpdateStatusByRecipient = async (transferId, senderEmail, newStatus) => {
    try {
      const { error } = await supabase
        .from('internal_transfers')
        .update({ status: newStatus })
        .eq('id', transferId);

      if (error) throw error;

      const title = newStatus === 'Confirmed' ? '🎉 Giao dịch thành công' : '⚠️ Giao dịch bị từ chối';
      const msg = newStatus === 'Confirmed' ? 'Người nhận đã xác nhận nhận được tiền.' : 'Người nhận thông báo chưa nhận được tiền.';

      await supabase.from('notifications').insert({
        user_email: senderEmail,
        title: title,
        message: msg
      });

      toast.success(newStatus === 'Confirmed' ? "Đã xác nhận nhận tiền thành công!" : "Đã từ chối giao dịch.");
      fetchTransfers();
    } catch (err) {
      toast.error("Lỗi: " + err.message);
    }
  };

  // 🌟 Hàm xử lý xóa giao dịch khi chưa hoàn thành
  const handleDeleteTransfer = async (transferId, recipientEmail) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa giao dịch?',
      text: "Hành động này sẽ xóa yêu cầu giao dịch chưa hoàn thành khỏi hệ thống.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase
        .from('internal_transfers')
        .delete()
        .eq('id', transferId);

      if (error) throw error;

      // Gửi thông báo cho người nhận biết giao dịch đã bị hủy/xóa
      await supabase.from('notifications').insert({
        user_email: recipientEmail,
        title: '🗑️ Giao dịch đã bị hủy',
        message: `Yêu cầu chuyển khoản liên quan đến bạn đã bị người gửi xóa khỏi hệ thống.`
      });

      toast.success("Đã xóa giao dịch thành công!");
      fetchTransfers();
    } catch (err) {
      toast.error("Lỗi khi xóa giao dịch: " + err.message);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', color: '#111827', fontSize: '18px' }}>💸 Chuyển khoản Nội bộ & Trạng thái Giao dịch</h3>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Chuyển tiền nhanh chóng giữa các thành viên, tự động sinh mã QR chuẩn VietQR.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setActiveSubTab('transfer')}
            style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: activeSubTab === 'transfer' ? '#2563eb' : '#f3f4f6', color: activeSubTab === 'transfer' ? 'white' : '#374151', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
          >
            💱 Giao dịch QR
          </button>
          <button 
            onClick={() => setActiveSubTab('guide')}
            style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: activeSubTab === 'guide' ? '#2563eb' : '#f3f4f6', color: activeSubTab === 'guide' ? 'white' : '#374151', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
          >
            📖 Hướng dẫn an toàn
          </button>
        </div>
      </div>

      {activeSubTab === 'guide' ? (
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', lineHeight: '1.6', fontSize: '14px', color: '#334151' }}>
          <h4 style={{ color: '#1e293b', marginTop: 0, fontSize: '16px' }}>🛡️ Quy tắc phòng ngừa rủi ro & Chống gian lận 2 chiều</h4>
          <ul style={{ paddingLeft: '20px', margin: '10px 0 0 0' }}>
            <li style={{ marginBottom: '10px' }}>
              <b>Tuyệt đối không dựa vào nút bấm để giao hàng/xác nhận:</b> Người nhận tuyệt đối không bấm nút "Đã nhận tiền" dựa trên thông báo hệ thống, mà phải mở trực tiếp ứng dụng ngân hàng của mình lên để kiểm tra xem tiền đã thực sự nổi trong tài khoản hay chưa.
            </li>
            <li style={{ marginBottom: '10px' }}>
              <b>Quy tắc đối soát biên lai:</b> Đối với các khoản tiền lớn hoặc quỹ Lab quan trọng, người chuyển nên gửi kèm ảnh chụp màn hình biên lai chuyển tiền thành công trực tiếp vào mục tải lên biên lai.
            </li>
            <li style={{ marginBottom: '10px' }}>
              <b>Lịch sử giao dịch:</b> Bạn có thể theo dõi toàn bộ các giao dịch mà bạn tham gia với tư cách là người gửi hoặc người nhận (Owner sẽ thấy toàn bộ hệ thống).
            </li>
            <li>
              <b>Xóa giao dịch:</b> Người chuyển có thể chủ động xóa các giao dịch của mình khi chúng chưa hoàn thành (chưa có trạng thái Confirmed).
            </li>
          </ul>
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', alignItems: 'flex-start', marginBottom: '30px' }}>
            
            <form onSubmit={handleCreateTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Tìm kiếm người nhận: *</label>
                <Select
                  options={recipientOptions}
                  value={selectedRecipient}
                  onChange={handleSelectRecipient}
                  placeholder="Gõ tên thành viên..."
                  styles={customSelectStyles}
                  isOptionDisabled={(option) => option.isDisabled}
                  formatOptionLabel={(option) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: option.isDisabled ? 0.6 : 1 }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e5e7eb', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                        {option.avatar ? <img src={option.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : option.label.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '13px', color: option.isDisabled ? '#9ca3af' : '#1f2937' }}>
                          {option.label} {!option.bank_account && <span style={{ color: '#ef4444', fontSize: '11px' }}>(Chưa điền STK)</span>}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>{option.value}</div>
                      </div>
                    </div>
                  )}
                />
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Số tiền (VNĐ): *</label>
                <input 
                  type="number" 
                  min="1000" 
                  value={amount} 
                  onChange={e => {
                    setAmount(e.target.value);
                    setShowQr(false);
                  }} 
                  placeholder="VD: 50000" 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} 
                />
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Nội dung chuyển khoản:</label>
                <input 
                  type="text" 
                  value={message} 
                  onChange={e => {
                    setMessage(e.target.value);
                    setShowQr(false);
                  }} 
                  placeholder="VD: Tiền quỹ trà sữa..." 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} 
                />
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Tải lên ảnh biên lai (Tùy chọn đối soát):</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setReceiptFile(e.target.files[0])}
                  style={{ fontSize: '13px', width: '100%' }}
                />
              </div>

              <button type="submit" style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                💲 Tạo yêu cầu & Hiển thị mã QR
              </button>
            </form>

            <div style={{ textAlign: 'center', backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#1f2937' }}>Mã QR Thanh toán Trực tiếp</h4>
              {showQr && qrUrl ? (
                <div>
                  <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '8px', display: 'inline-block', border: '1px solid #e5e7eb' }}>
                    <img src={qrUrl} alt="QR Code" style={{ width: '180px', height: '180px', objectFit: 'contain' }} />
                  </div>
                  <p style={{ fontSize: '12px', color: '#4b5563', margin: '8px 0' }}>Quét mã QR qua app ngân hàng để chuyển tiền cho <b>{selectedRecipient?.label}</b>.</p>
                  
                  {activeTransferId && (
                    <button 
                      onClick={() => {
                        const tr = transfers.find(t => t.id === activeTransferId);
                        if (tr) handleMarkAsPaid(tr.id, tr.recipient_email);
                      }} 
                      style={{ padding: '8px 16px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                    >
                      🚀 Đã quét & Chuyển tiền xong (Báo Paid)
                    </button>
                  )}
                </div>
              ) : (
                <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '13px', padding: '40px 0' }}>Vui lòng điền thông tin và bấm <b>"Tạo yêu cầu & Hiển thị mã QR"</b> để xuất mã thanh toán.</p>
              )}
            </div>
          </div>

          {/* LỊCH SỬ GIAO DỊCH */}
          <div style={{ marginTop: '30px' }}>
            <h4 style={{ color: '#111827', fontSize: '16px', marginBottom: '15px' }}>
              {isOwner ? '📜 Lịch sử giao dịch toàn hệ thống (Owner)' : '📜 Lịch sử giao dịch của bạn'}
            </h4>
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                  <tr>
                    <th style={{ padding: '10px 12px' }}>Gửi từ</th>
                    <th style={{ padding: '10px 12px' }}>Đến</th>
                    <th style={{ padding: '10px 12px' }}>Số tiền</th>
                    <th style={{ padding: '10px 12px' }}>Nội dung / Biên lai</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Trạng thái</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>Đang tải lịch sử...</td></tr>
                  ) : transfers.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>Chưa có giao dịch nội bộ nào.</td></tr>
                  ) : (
                    transfers.map(t => {
                      const isSender = t.sender_email === currentUserEmail;
                      const isNotCompleted = t.status !== 'Confirmed'; // Chưa hoàn thành (Pending, Paid, Rejected)
                      
                      let badgeBg = '#fef3c7'; let badgeColor = '#92400e'; let statusText = 'Đang chờ (Pending)';
                      if (t.status === 'Paid') { badgeBg = '#e0f2fe'; badgeColor = '#0369a1'; statusText = 'Đã trả (Paid)'; }
                      else if (t.status === 'Confirmed') { badgeBg = '#d1fae5'; badgeColor = '#065f46'; statusText = 'Hoàn thành (Confirmed)'; }
                      else if (t.status === 'Rejected') { badgeBg = '#fee2e2'; badgeColor = '#991b1b'; statusText = 'Đã từ chối (Rejected)'; }

                      return (
                        <tr key={t.id} style={{ borderBottom: '1px solid #f1f3f5' }}>
                          <td style={{ padding: '10px 12px', fontWeight: '500' }}>{t.sender?.full_name || t.sender_email}</td>
                          <td style={{ padding: '10px 12px', fontWeight: '500' }}>{t.recipient?.full_name || t.recipient_email}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 'bold', color: '#059669' }}>{Number(t.amount).toLocaleString('vi-VN')} đ</td>
                          <td style={{ padding: '10px 12px', color: '#4b5563' }}>{t.message || '-'}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', backgroundColor: badgeBg, color: badgeColor }}>
                              {statusText}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                              {isSender && t.status === 'Pending' && (
                                <button 
                                  onClick={() => handleMarkAsPaid(t.id, t.recipient_email)}
                                  style={{ padding: '5px 10px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                  Xác nhận đã chuyển
                                </button>
                              )}

                              {!isSender && t.status === 'Paid' && (
                                <>
                                  <button 
                                    onClick={() => handleUpdateStatusByRecipient(t.id, t.sender_email, 'Confirmed')}
                                    style={{ padding: '5px 8px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                                  >
                                    Đã nhận tiền
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateStatusByRecipient(t.id, t.sender_email, 'Rejected')}
                                    style={{ padding: '5px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                                  >
                                    Chưa nhận
                                  </button>
                                </>
                              )}

                              {/* 🌟 Nút Xóa: Chỉ người chuyển (hoặc Owner) được xóa khi giao dịch chưa hoàn thành (chưa Confirmed) */}
                              {(isSender || isOwner) && isNotCompleted && (
                                <button 
                                  onClick={() => handleDeleteTransfer(t.id, t.recipient_email)}
                                  style={{ padding: '5px 8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                                  title="Xóa giao dịch chưa hoàn thành"
                                >
                                  Xóa
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}