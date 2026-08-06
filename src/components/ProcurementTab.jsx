import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { BANK_LIST } from './bankList';

export default function ProcurementTab({ session, role }) {
  const [procurements, setProcurements] = useState([]);
  const [loading, setLoading] = useState(true);

  // State quản lý trạng thái loading cục bộ
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null); 
  const [deletingId, setDeletingId] = useState(null); 

  // Bộ lọc và tìm kiếm bổ sung cho Student & Lecturer
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('Tất cả'); // 'Tất cả', 'Phiếu của tôi', hoặc trạng thái cụ thể

  // Modal State tạo đề xuất mới
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [productLink, setProductLink] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [bankCode, setBankCode] = useState('970436');
  const [bankAccount, setBankAccount] = useState('');

  const currentUser = session?.user?.email;
  const isLecturerOrAdmin = role === 'Lecturer' || role === 'Admin';
  const isLecturer = role === 'Lecturer';

  // Lấy dữ liệu đề xuất mua sắm
  const fetchProcurements = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('procurements')
        .select('*, users(full_name, bank_code, bank_account)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProcurements(data);
    } catch (err) {
      console.error("Lỗi tải danh sách mua sắm:", err);
      toast.error("Không thể tải danh sách đề xuất mua sắm.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserProfileBank = useCallback(async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('users')
      .select('bank_code, bank_account')
      .eq('email', currentUser)
      .single();
    if (data) {
      if (data.bank_code) setBankCode(data.bank_code);
      if (data.bank_account) setBankAccount(data.bank_account);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchProcurements();
      fetchUserProfileBank();
    }
  }, [currentUser, fetchProcurements, fetchUserProfileBank]);

  // Khi mở modal, tự động nạp lại thông tin ngân hàng mới nhất từ profile cá nhân để đảm bảo luôn mượt mà
  const handleOpenModal = () => {
    fetchUserProfileBank();
    setIsModalOpen(true);
  };

  // Submit tạo đề xuất mới (có kiểm tra URL hợp lệ bằng Regex cơ bản)
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) {
      return toast.error("Vui lòng nhập tên vật tư cần mua!");
    }
    if (!bankAccount.trim()) {
      return toast.error("Vui lòng nhập số tài khoản ngân hàng để nhận giải ngân!");
    }

    // Kiểm tra định dạng URL nếu sinh viên có nhập link sản phẩm
    if (productLink.trim()) {
      try {
        new URL(productLink.trim());
      } catch {
        return toast.error("Link sản phẩm tham khảo không hợp lệ! Vui lòng kiểm tra lại định dạng URL.");
      }
    }

    setIsSubmitting(true);

    // Tự động lưu / nhớ thông tin ngân hàng cá nhân vào profile
    await supabase.from('users').update({
      bank_code: bankCode,
      bank_account: bankAccount.trim()
    }).eq('email', currentUser);

    const { error } = await supabase.from('procurements').insert({
      user_email: currentUser,
      item_name: itemName.trim(),
      quantity: parseInt(quantity) || 1,
      product_link: productLink.trim(),
      estimated_price: estimatedPrice ? parseFloat(estimatedPrice) : null,
      status: 'Chờ duyệt'
    });

    if (error) {
      toast.error("Lỗi gửi đề xuất: " + error.message);
    } else {
      toast.success("🛒 Đã gửi đề xuất mua sắm thành công!");
      setItemName('');
      setQuantity(1);
      setProductLink('');
      setEstimatedPrice('');
      setIsModalOpen(false);
      await fetchProcurements();
    }
    setIsSubmitting(false);
  };

  // Hàm cho phép sinh viên tải ảnh hóa đơn lên kho 'receipts'
  const handleUploadReceipt = async (item) => {
    const { value: file } = await Swal.fire({
      title: '📤 Tải lên ảnh hóa đơn / chứng từ',
      input: 'file',
      inputAttributes: {
        accept: 'image/*',
        ariaLabel: 'Tải ảnh hóa đơn của bạn'
      },
      text: 'Chọn ảnh hóa đơn mua sắm để giảng viên kiểm tra trước khi giải ngân.',
      showCancelButton: true,
      confirmButtonText: 'Tải lên',
      cancelButtonText: 'Hủy'
    });

    if (file) {
      setActionLoadingId(item.id);
      try {
        if (item.product_link && item.product_link.includes('/storage/v1/object/public/receipts/')) {
          try {
            const urlParts = item.product_link.split('/storage/v1/object/public/receipts/');
            if (urlParts.length > 1) {
              const oldFilePath = decodeURIComponent(urlParts[1].split('?')[0]);
              if (oldFilePath) {
                await supabase.storage.from('receipts').remove([oldFilePath]);
              }
            }
          } catch (delErr) {
            console.error("Không thể xóa file hóa đơn cũ trên storage:", delErr);
          }
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `receipt_${item.id}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('receipts') 
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicURLData } = supabase.storage
          .from('receipts')
          .getPublicUrl(fileName);

        const receiptUrl = publicURLData.publicUrl;

        const { error: updateError } = await supabase
          .from('procurements')
          .update({ product_link: receiptUrl })
          .eq('id', item.id);

        if (updateError) throw updateError;

        toast.success("🎉 Tải ảnh hóa đơn thành công!");
        await fetchProcurements();
      } catch (err) {
        toast.error("Lỗi tải ảnh lên: " + err.message);
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  // Giảng viên / Admin duyệt và giải ngân bảo mật (Có liên thông tự động log vào internal_transfers)
  const handleReview = async (item, newStatus) => {
    if (newStatus === 'Đã giải ngân') {
      const bCode = item.users?.bank_code;
      const bAccount = item.users?.bank_account;
      const amount = item.estimated_price || 0;
      const studentName = item.users?.full_name || item.user_email;

      if (!bAccount || !bCode) {
        return Swal.fire({
          title: 'Chưa có thông tin ngân hàng!',
          html: `Thành viên <b>${studentName}</b> chưa cung cấp đầy đủ thông tin tài khoản ngân hàng nhận tiền.`,
          icon: 'warning',
          confirmButtonColor: '#2563eb'
        });
      }

      const encodedName = encodeURIComponent(studentName.toUpperCase());
      const encodedInfo = encodeURIComponent(`Giai ngon ${item.item_name}`);
      const qrUrl = `https://img.vietqr.io/image/${bCode}-${bAccount}-compact2.png?amount=${amount}&addInfo=${encodedInfo}&accountName=${encodedName}`;

      Swal.fire({
        title: '💸 Quét QR Giải ngân Tài chính Bảo mật',
        html: `
          <div style="text-align: center;">
            <p style="font-size: 14px; color: #374151; margin-bottom: 8px;">
              Người nhận: <b style="text-transform: capitalize;">${studentName}</b><br/>
              Số tiền thanh toán: <b style="color: #059669; font-size: 16px;">${Number(amount).toLocaleString('vi-VN')} đ</b>
            </p>
            
            <div style="background: #f9fafb; padding: 10px; border-radius: 12px; display: inline-block; border: 1px solid #e5e7eb; margin-top: 5px;">
              <img src="${qrUrl}" alt="VietQR Code" style="width: 200px; height: 200px; objectFit: contain; border-radius: 8px;" />
            </div>
            
            <p style="font-size: 12px; color: #6b7280; margin-top: 8px; font-style: italic;">
              * Thông tin số tài khoản đã được mã hóa bảo mật tuyệt đối. Dùng app ngân hàng quét mã QR trên để chuyển khoản chính xác, sau đó bấm xác nhận hoàn tất.
            </p>
          </div>
        `,
        input: 'text',
        inputLabel: 'Ghi chú tài chính (tùy chọn):',
        inputPlaceholder: 'VD: Đã chuyển khoản qua quỹ Lab...',
        inputValue: item.lecturer_note || '',
        showCancelButton: true,
        confirmButtonColor: '#7c3aed',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '✅ Xác nhận đã thanh toán xong',
        cancelButtonText: 'Hủy'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const lecturerNote = result.value || '';

          setActionLoadingId(item.id); 
          const { error } = await supabase
            .from('procurements')
            .update({ status: 'Đã mua', lecturer_note: lecturerNote })
            .eq('id', item.id);

          if (error) {
            toast.error("Lỗi cập nhật: " + error.message);
          } else {
            // 🌟 Liên thông tự động ghi log vào bảng chuyển khoản nội bộ (internal_transfers)
            await supabase.from('internal_transfers').insert({
              sender_email: currentUser,
              recipient_email: item.user_email,
              amount: amount,
              message: `Giải ngân mua sắm: ${item.item_name} | ${lecturerNote}`,
              status: 'Confirmed'
            });

            toast.success("🎉 Đã thanh toán, đồng bộ quỹ nội bộ & cập nhật hoàn thành!");
            setProcurements(prev => prev.map(p => p.id === item.id ? { ...p, status: 'Đã mua', lecturer_note: lecturerNote } : p));
          }
          setActionLoadingId(null); 
        }
      });
      return;
    }

    let titleText = 'Phê duyệt đề xuất?';
    let confirmColor = '#10b981';

    if (newStatus === 'Từ chối') {
      titleText = 'Từ chối đề xuất?';
      confirmColor = '#dc3545';
    }

    Swal.fire({
      title: titleText,
      html: `Mặt hàng: <b>${item.item_name}</b> (SL: ${item.quantity})`,
      input: 'text',
      inputLabel: 'Ghi chú tài chính / Lý do (tùy chọn):',
      inputPlaceholder: 'VD: Ghi chú thêm...',
      inputValue: item.lecturer_note || '',
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const lecturerNote = result.value || '';

        setActionLoadingId(item.id); 
        const { error } = await supabase
          .from('procurements')
          .update({ status: newStatus, lecturer_note: lecturerNote })
          .eq('id', item.id);

        if (error) {
          toast.error("Lỗi cập nhật: " + error.message);
        } else {
          toast.success(`Đã cập nhật trạng thái thành công: ${newStatus}`);
          setProcurements(prev => prev.map(p => p.id === item.id ? { ...p, status: newStatus, lecturer_note: lecturerNote } : p));
        }
        setActionLoadingId(null); 
      }
    });
  };

  const handleDelete = async (id, productLinkUrl) => {
    Swal.fire({
      title: 'Xóa đề xuất này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setDeletingId(id); 
        try {
          if (productLinkUrl && productLinkUrl.includes('/storage/v1/object/public/receipts/')) {
            const urlParts = productLinkUrl.split('/storage/v1/object/public/receipts/');
            if (urlParts.length > 1) {
              const filePath = decodeURIComponent(urlParts[1].split('?')[0]);
              if (filePath) {
                await supabase.storage.from('receipts').remove([filePath]);
              }
            }
          }

          const { error } = await supabase.from('procurements').delete().eq('id', id);
          if (error) throw error;

          toast.success("Đã xóa đề xuất.");
          setProcurements(prev => prev.filter(p => p.id !== id));
        } catch (err) {
          toast.error("Lỗi khi xóa: " + err.message);
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  // Thống kê nhanh tổng ngân sách/chi phí & Lọc dữ liệu thông minh
  const { stats, filteredProcurements } = useMemo(() => {
    let pendingCount = 0;
    let totalEstimatedThisMonth = 0;
    const now = new Date();

    procurements.forEach(item => {
      if (item.status === 'Chờ duyệt') {
        pendingCount++;
      }
      // Tính tổng tiền dự kiến các phiếu đang hoạt động hoặc trong tháng hiện tại
      const createdAt = new Date(item.created_at);
      if (createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()) {
        if (item.status !== 'Từ chối') {
          totalEstimatedThisMonth += Number(item.estimated_price || 0);
        }
      }
    });

    // Lọc theo Search Term (tên vật tư) và Filter Mode (tab trạng thái / phiếu của tôi)
    const result = procurements.filter(item => {
      const matchName = item.item_name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchName) return false;

      if (filterMode === 'Phiếu của tôi') {
        return item.user_email === currentUser;
      }
      if (filterMode !== 'Tất cả') {
        // Đối với tab 'Đã mua', kiểm tra status 'Đã mua'
        return item.status === filterMode;
      }
      return true;
    });

    return {
      stats: { pendingCount, totalEstimatedThisMonth },
      filteredProcurements: result
    };
  }, [procurements, searchTerm, filterMode, currentUser]);

  return (
    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', color: '#111827', fontSize: '18px' }}>🛒 Quản lý Đề xuất Mua sắm & Giải ngân Tài chính</h3>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            {isLecturerOrAdmin 
              ? 'Phê duyệt, kiểm tra hóa đơn và quét QR giải ngân bảo mật.' 
              : 'Tạo phiếu đề xuất, tải lên hóa đơn và theo dõi trạng thái giải ngân.'}
          </p>
        </div>

        {!isLecturer && (
          <button 
            onClick={handleOpenModal}
            style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37,99,235,0.2)' }}
          >
            + Tạo đề xuất mới
          </button>
        )}
      </div>

      {/* 🌟 THỐNG KÊ NHANH TỔNG NGÂN SÁCH / CHI PHÍ CHO LECTURER & ADMIN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#eff6ff', padding: '15px', borderRadius: '12px', border: '1px solid #dbeafe' }}>
          <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: 'bold', textTransform: 'uppercase' }}>Đề xuất đang chờ duyệt</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a8a', marginTop: '5px' }}>{stats.pendingCount} phiếu</div>
        </div>
        <div style={{ backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '12px', border: '1px solid #dcfce7' }}>
          <div style={{ fontSize: '12px', color: '#166534', fontWeight: 'bold', textTransform: 'uppercase' }}>Dự kiến chi phí tháng này</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#14532d', marginTop: '5px' }}>{stats.totalEstimatedThisMonth.toLocaleString('vi-VN')} đ</div>
        </div>
      </div>

      {/* 🌟 THANH TÌM KIẾM NHANH & BỘ LỌC TRẠNG THÁI (FILTER TABS) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['Tất cả', 'Phiếu của tôi', 'Chờ duyệt', 'Đã duyệt', 'Đã giải ngân', 'Đã mua', 'Từ chối'].map(mode => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1px solid #d1d5db',
                backgroundColor: filterMode === mode ? '#2563eb' : '#f9fafb',
                color: filterMode === mode ? 'white' : '#374151',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {mode}
            </button>
          ))}
        </div>

        <div>
          <input 
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="🔍 Tìm nhanh tên vật tư..."
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', width: '220px', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: 'white' }}>
          <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
            <tr>
              <th style={{ padding: '12px 15px', color: '#495057', fontSize: '13px' }}>Người đề xuất</th>
              <th style={{ padding: '12px 15px', color: '#495057', fontSize: '13px' }}>Tên vật tư / Hóa chất</th>
              <th style={{ padding: '12px 15px', color: '#495057', fontSize: '13px', textAlign: 'center' }}>Số lượng</th>
              <th style={{ padding: '12px 15px', color: '#495057', fontSize: '13px' }}>Chi phí & Hóa đơn</th>
              <th style={{ padding: '12px 15px', color: '#495057', fontSize: '13px', textAlign: 'center' }}>Trạng thái quy trình</th>
              <th style={{ padding: '12px 15px', color: '#495057', fontSize: '13px', textAlign: 'center' }}>Thao tác quản lý</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#adb5bd', fontStyle: 'italic' }}>
                  ⏳ Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredProcurements.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#adb5bd', fontStyle: 'italic' }}>
                  Không tìm thấy phiếu đề xuất nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredProcurements.map(item => {
                const isMine = item.user_email === currentUser;
                const isUpdatingThis = actionLoadingId === item.id;
                const isDeletingThis = deletingId === item.id;

                let badgeBg = '#fef3c7'; let badgeColor = '#92400e'; 
                if (item.status === 'Đã duyệt') { badgeBg = '#d1fae5'; badgeColor = '#065f46'; }
                else if (item.status === 'Đã giải ngân') { badgeBg = '#e0f2fe'; badgeColor = '#0369a1'; }
                else if (item.status === 'Đã mua') { badgeBg = '#f3e8ff'; badgeColor = '#6b21a8'; }
                else if (item.status === 'Từ chối') { badgeBg = '#fee2e2'; badgeColor = '#991b1b'; }

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f3f5' }}>
                    <td style={{ padding: '12px 15px', fontWeight: '600', color: '#343a40', fontSize: '14px' }}>
                      {item.users?.full_name || item.user_email}
                    </td>
                    <td style={{ padding: '12px 15px', color: '#1f2937', fontWeight: '500', fontSize: '14px' }}>
                      {item.item_name}
                      {item.lecturer_note && (
                        <div style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic', marginTop: '3px' }}>
                          💬 Ghi chú: {item.lecturer_note}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 15px', textAlign: 'center', fontWeight: 'bold', color: '#4b5563', fontSize: '14px' }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: '12px 15px', fontSize: '13px' }}>
                      <div style={{ fontWeight: 'bold', color: '#059669' }}>
                        {item.estimated_price ? `${Number(item.estimated_price).toLocaleString('vi-VN')} đ` : 'Chưa rõ'}
                      </div>
                      {item.product_link ? (
                        <a href={item.product_link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '12px', display: 'block', marginTop: '3px' }}>
                          🧾 Xem hóa đơn / Link
                        </a>
                      ) : <span style={{ color: '#9ca3af', fontSize: '12px' }}>Chưa có hóa đơn</span>}
                    </td>
                    <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                      <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: badgeBg, color: badgeColor, display: 'inline-block' }}>
                        {isUpdatingThis ? '⏳ Đang cập nhật...' : (item.status === 'Đã mua' ? 'Hoàn thành' : item.status)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        
                        {isMine && item.status === 'Đã duyệt' && (
                          <button 
                            onClick={() => handleUploadReceipt(item)}
                            disabled={isUpdatingThis}
                            style={{ padding: '6px 10px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            📤 Up hóa đơn
                          </button>
                        )}

                        {isLecturerOrAdmin && (
                          <>
                            {item.status === 'Chờ duyệt' && (
                              <>
                                <button 
                                  onClick={() => handleReview(item, 'Đã duyệt')}
                                  disabled={isUpdatingThis}
                                  style={{ padding: '6px 10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                  Duyệt
                                </button>
                                <button 
                                  onClick={() => handleReview(item, 'Từ chối')}
                                  disabled={isUpdatingThis}
                                  style={{ padding: '6px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                  Từ chối
                                </button>
                              </>
                            )}

                            {item.status === 'Đã duyệt' && (
                              <button 
                                onClick={() => handleReview(item, 'Đã giải ngân')}
                                disabled={isUpdatingThis}
                                style={{ padding: '6px 10px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                              >
                                💸 Giải ngân & Quét QR bảo mật
                              </button>
                            )}
                          </>
                        )}

                        {(isMine || role === 'Admin') && (
                          <button 
                            onClick={() => handleDelete(item.id, item.product_link)}
                            disabled={isDeletingThis}
                            style={{ padding: '6px 10px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
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

      {/* ================= MODAL TẠO ĐỀ XUẤT MỚI ================= */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '500px', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '18px' }}>🛒 Tạo Đề xuất Mua sắm Vật tư</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold', color: '#6b7280' }}>✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Tên vật tư / Hóa chất cần mua: *</label>
                <input 
                  type="text" 
                  value={itemName} 
                  onChange={e => setItemName(e.target.value)} 
                  placeholder="VD: Bột Titan tinh khiết..." 
                  required 
                  style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Số lượng:</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={quantity} 
                    onChange={e => setQuantity(e.target.value)} 
                    style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} 
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Giá dự kiến (VNĐ): *</label>
                  <input 
                    type="number" 
                    value={estimatedPrice} 
                    onChange={e => setEstimatedPrice(e.target.value)} 
                    placeholder="VD: 500000" 
                    required
                    style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Link sản phẩm tham khảo (nếu có):</label>
                <input 
                  type="text" 
                  value={productLink} 
                  onChange={e => setProductLink(e.target.value)} 
                  placeholder="https://shopee.vn/..." 
                  style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} 
                />
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '15px', marginTop: '5px' }}>
                <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#2563eb', marginBottom: '10px' }}>💳 Thông tin tài khoản ngân hàng nhận giải ngân:</p>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '12px', display: 'block', marginBottom: '5px' }}>Chọn ngân hàng: *</label>
                  <select 
                    value={bankCode} 
                    onChange={e => setBankCode(e.target.value)}
                    style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', backgroundColor: 'white' }}
                  >
                    {BANK_LIST.map(b => (
                      <option key={b.code} value={b.code}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '12px', display: 'block', marginBottom: '5px' }}>Số tài khoản nhận tiền: *</label>
                  <input 
                    type="text" 
                    value={bankAccount} 
                    onChange={e => setBankAccount(e.target.value)} 
                    placeholder="VD: 0123456789" 
                    required 
                    style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  style={{ padding: '10px 18px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  style={{ padding: '10px 18px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? '⏳ Đang gửi...' : 'Gửi đề xuất'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}