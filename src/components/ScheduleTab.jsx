import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import bcrypt from 'bcryptjs';

export default function ScheduleTab({ session, role, readOnly }) {
    const isReadOnly = readOnly || role === 'Lecturer';
    const isAdmin = role === 'Admin';
    const isLecturer = role === 'Lecturer';
    const currentUserEmail = session?.user?.email;

    const SUPREME_ADMIN_EMAIL = 'anh.p237957@sis.hust.edu.vn';
    const isSupremeAdmin = currentUserEmail === SUPREME_ADMIN_EMAIL;

    const [equipments, setEquipments] = useState([]);
    const [selectedEquip, setSelectedEquip] = useState(null);
    const [weekStart, setWeekStart] = useState(getMonday(new Date()));
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🌟 1. State cho bộ lọc "Chỉ hiển thị lịch của tôi"
    const [showOnlyMyBookings, setShowOnlyMyBookings] = useState(false);

    const hours = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

    function getMonday(d) {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    }
    
    const weekDays = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(weekStart); 
        d.setDate(d.getDate() + i); 
        return d;
    });

    const formatDateString = (dateObj) => {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const todayStr = formatDateString(new Date());

    useEffect(() => {
        const fetchEquipments = async () => {
            const { data, error } = await supabase.from('equipments').select('*').order('id');
            if (error) {
                toast.error("Lỗi tải thiết bị: " + error.message);
            } else if (data && data.length > 0) {
                setEquipments(data);
                setSelectedEquip(data[0]);
            }
        };
        fetchEquipments();
    }, []);

    const fetchBookings = async () => {
        if (!selectedEquip) return;
        setLoading(true);

        const startOfWeek = new Date(weekStart); startOfWeek.setHours(0,0,0,0);
        const endOfWeek = new Date(weekStart); endOfWeek.setDate(endOfWeek.getDate() + 6); endOfWeek.setHours(23,59,59,999);
        
        const { data, error } = await supabase.from('bookings')
            .select('*, users(full_name)')
            .eq('equipment_id', selectedEquip.id)
            .gte('start_time', startOfWeek.toISOString())
            .lte('start_time', endOfWeek.toISOString());
            
        if (error) {
            toast.error("Lỗi tải lịch đặt: " + error.message);
        } else {
            setBookings(data || []);
        }
        setLoading(false);
    };

    useEffect(() => { 
        fetchBookings(); 
    }, [selectedEquip, weekStart]);

    const getBookingForSlot = (date, hourStr) => {
        const slotStart = new Date(date);
        const [h, m] = hourStr.split(':');
        slotStart.setHours(parseInt(h), parseInt(m), 0, 0);
        const slotTime = slotStart.getTime();

        return bookings.find(b => {
            const bStart = new Date(b.start_time).getTime();
            const bEnd = new Date(b.end_time).getTime();
            return slotTime >= bStart && slotTime < bEnd;
        });
    };

    const handleSlotClick = async (date, hourStr, existingBooking) => {
        const dateStr = formatDateString(date);

        if (!existingBooking && dateStr < todayStr) {
            return toast.error("Không thể đăng ký lịch cho những ngày đã trôi qua!");
        }

        if (selectedEquip?.status === 'Hỏng' || selectedEquip?.status === 'Đang bảo trì') {
            return toast.error("Thiết bị này đang bảo trì, không thể thao tác!");
        }
        
        const isMine = existingBooking?.user_email === currentUserEmail;

        if (existingBooking) {
            let userName = existingBooking.users?.full_name || 'Thành viên';
            if (isMine && session?.user?.user_metadata?.full_name) {
                userName = session.user.user_metadata.full_name;
            }
            
            const purposeDisplay = (existingBooking.purpose || 'Không có mô tả').replace(/\n/g, '<br/>');
            const startTimeStr = new Date(existingBooking.start_time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
            const endTimeStr = new Date(existingBooking.end_time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});

            if (isMine || isAdmin || isLecturer) {
                if (isMine && !isSupremeAdmin) {
                    const { data: userData, error: userErr } = await supabase
                        .from('users')
                        .select('pin_code')
                        .eq('email', currentUserEmail)
                        .single();

                    if (userErr || !userData?.pin_code) {
                        return Swal.fire({
                            title: 'Chưa thiết lập mã PIN!',
                            text: 'Bạn chưa tạo mã PIN 4 chữ số. Vui lòng vào phần "Cài đặt tài khoản" để thiết lập trước khi hủy lịch.',
                            icon: 'warning',
                            confirmButtonColor: '#2563eb'
                        });
                    }

                    Swal.fire({
                        title: 'Xác nhận hủy lịch?',
                        html: `Hủy lịch của <b style="text-transform: capitalize;">${userName}</b> (${startTimeStr} - ${endTimeStr}) ngày <b>${date.toLocaleDateString('vi-VN')}</b>?<br/><br/>
                               <span style="font-size: 13px; color: #4b5563;">Vui lòng nhập mã PIN cá nhân 4 chữ số để xác thực:</span>`,
                        input: 'password',
                        inputAttributes: {
                            maxlength: 4,
                            autocapitalize: 'off',
                            autocorrect: 'off'
                        },
                        inputPlaceholder: '••••',
                        showCancelButton: true,
                        confirmButtonColor: '#dc3545',
                        cancelButtonColor: '#6c757d',
                        confirmButtonText: 'Xác nhận hủy',
                        cancelButtonText: 'Đóng'
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            const enteredPin = result.value;
                            const isPinValid = bcrypt.compareSync(enteredPin, userData.pin_code);

                            if (isPinValid) {
                                const { error } = await supabase.from('bookings').delete().eq('id', existingBooking.id);
                                if (error) {
                                    toast.error("Lỗi khi hủy lịch: " + error.message);
                                } else {
                                    toast.success("🗑️ Đã hủy lịch thành công!");
                                    fetchBookings();
                                }
                            } else {
                                toast.error("❌ Mã PIN không chính xác! Không thể hủy lịch.");
                            }
                        }
                    });
                } else {
                    Swal.fire({
                        title: 'Xác nhận hủy lịch?',
                        html: `Hủy lịch của <b style="text-transform: capitalize;">${userName}</b><br/>
                               Khoảng thời gian: <b>${startTimeStr} - ${endTimeStr}</b><br/>
                               Ngày <b>${date.toLocaleDateString('vi-VN')}</b>?`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#dc3545',
                        cancelButtonColor: '#6c757d',
                        confirmButtonText: 'Đồng ý, Hủy lịch!',
                        cancelButtonText: 'Đóng'
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            const { error } = await supabase.from('bookings').delete().eq('id', existingBooking.id);
                            if (error) {
                                toast.error("Lỗi khi hủy lịch: " + error.message);
                            } else {
                                toast.success("Đã hủy lịch thành công!");
                                fetchBookings();
                            }
                        }
                    });
                }
            } else {
                Swal.fire({
                    title: 'Chi tiết lịch đặt',
                    html: `Người đặt: <b style="text-transform: capitalize; color: #0056b3;">${userName}</b><br/>
                           Thời gian: <b>${startTimeStr} - ${endTimeStr}</b><br/>
                           <hr style="border-top:1px dashed #ccc; margin: 10px 0;" />
                           <div style="text-align: left; font-size: 14px;">${purposeDisplay}</div>`,
                    icon: 'info',
                    confirmButtonText: 'Đóng'
                });
            }
            return;
        }

        if (isReadOnly) {
            return toast.success("Khung giờ này trống (Chế độ chỉ xem lịch Lab).");
        }

        const slotStart = new Date(date);
        const [h, m] = hourStr.split(':');
        const currentHour = parseInt(h);
        slotStart.setHours(currentHour, parseInt(m), 0, 0);

        let hourOptions = '';
        for(let i = currentHour + 1; i <= 21; i++) {
            hourOptions += `<option value="${i}">${i.toString().padStart(2, '0')}:00</option>`;
        }

        // 🌟 2. Cải tiến form SweetAlert2 cho Đặt lịch nhanh nhiều khung giờ / Lặp lại hàng tuần
        Swal.fire({
            title: `Đăng ký ${selectedEquip.name}`,
            html: `
                <div style="text-align: left; font-size: 14px; margin-top: 10px;">
                    <p style="color: #6b7280; font-style: italic; margin-bottom: 15px;">
                        Bắt đầu từ: <b>${hourStr}</b> ngày <b>${date.toLocaleDateString('vi-VN')}</b>
                    </p>

                    <label style="display:block; font-weight: bold; margin-bottom: 5px;">Mục đích / Tên bài thí nghiệm: *</label>
                    <input id="swal-purpose" class="swal2-input" style="margin:0 0 15px 0; width: 100%; box-sizing: border-box; height: 42px; font-size: 14px;" value="${isAdmin ? 'Quản trị / Kiểm tra kỹ thuật' : 'Nghiên cứu / Thực hành'}">

                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <div style="flex: 1;">
                            <label style="display:block; font-weight: bold; margin-bottom: 5px;">Mẫu vật liệu:</label>
                            <input id="swal-material" class="swal2-input" style="margin:0; width: 100%; box-sizing: border-box; height: 42px; font-size: 14px;" placeholder="VD: Bột Titan...">
                        </div>
                        <div style="flex: 1;">
                            <label style="display:block; font-weight: bold; margin-bottom: 5px;">Số lượng mẫu:</label>
                            <input id="swal-quantity" type="number" min="1" class="swal2-input" style="margin:0; width: 100%; box-sizing: border-box; height: 42px; font-size: 14px;" placeholder="VD: 5">
                        </div>
                    </div>

                    <label style="display:block; font-weight: bold; margin-bottom: 5px; color: #dc2626;">Thời gian kết thúc dự kiến: *</label>
                    <select id="swal-end-time" class="swal2-select" style="margin:0 0 15px 0; width: 100%; box-sizing: border-box; height: 42px; font-size: 14px; border: 1px solid #d1d5db; border-radius: 6px;">
                        ${hourOptions}
                    </select>

                    <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px dashed #cbd5e1;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: bold; color: #1e40af; font-size: 13px;">
                            <input id="swal-repeat" type="checkbox" style="width: 16px; height: 16px; cursor: pointer;">
                            🔁 Đặt lặp lại cố định khung giờ này mỗi tuần (trong 4 tuần tới)
                        </label>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Xác nhận đặt',
            cancelButtonText: 'Hủy bỏ',
            preConfirm: () => {
                const purpose = document.getElementById('swal-purpose').value;
                const material = document.getElementById('swal-material').value;
                const quantity = document.getElementById('swal-quantity').value;
                const endHour = document.getElementById('swal-end-time').value;
                const isRepeat = document.getElementById('swal-repeat').checked;

                if (!purpose) {
                    Swal.showValidationMessage('Vui lòng nhập mục đích sử dụng!');
                    return false;
                }
                return { purpose, material, quantity, endHour, isRepeat };
            }
        }).then(async (result) => {
            if (result.isConfirmed && result.value) {
                const { purpose, material, quantity, endHour, isRepeat } = result.value;

                let finalPurpose = purpose;
                if (material || quantity) {
                    finalPurpose += `\n📦 Mẫu: ${material || 'Không rõ'} | Số lượng: ${quantity || 0}`;
                }

                // Lấy trực tiếp giá trị giờ kết thúc người dùng chọn (Khắc phục lỗi lệch giờ lên 17h)
                const finalEndHour = parseInt(endHour);
                
                // Số tuần lặp lại (1 tuần nếu đặt thường, 4 tuần nếu chọn lặp lại)
                const weeksToRepeat = isRepeat ? 4 : 1;
                let hasError = false;

                // Hàm chuyển đổi sang định dạng ISO giữ nguyên chuẩn múi giờ địa phương
                const formatLocalDateToISO = (dateObj) => {
                    const year = dateObj.getFullYear();
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    const hours = String(dateObj.getHours()).padStart(2, '0');
                    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
                    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
                };

                for (let w = 0; w < weeksToRepeat; w++) {
                    const currentSlotStart = new Date(slotStart);
                    currentSlotStart.setDate(currentSlotStart.getDate() + (w * 7));

                    const currentSlotEnd = new Date(currentSlotStart);
                    currentSlotEnd.setHours(finalEndHour, 0, 0, 0); // Gán chính xác giờ kết thúc

                    const { error } = await supabase.rpc('book_equipment', {
                        p_equip_id: selectedEquip.id, 
                        p_start: formatLocalDateToISO(currentSlotStart), 
                        p_end: formatLocalDateToISO(currentSlotEnd),
                        p_purpose: isRepeat ? `${finalPurpose} (Lặp lại tuần ${w + 1}/4)` : finalPurpose
                    });

                    if (error) {
                        hasError = true;
                        toast.error(`Lỗi đặt lịch tuần ${w + 1}: ` + error.message);
                        break;
                    }
                }
                
                if (!hasError) {
                    toast.success(isRepeat ? "🎉 Đặt lịch lặp lại 4 tuần thành công!" : "🎉 Đặt lịch thành công!");
                    fetchBookings();
                }
            }
        });
    };

    return (
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#111827', fontSize: '18px' }}>
                    📅 Lịch Đặt Thiết Bị Lab {isReadOnly && <span style={{ color: '#dc2626', fontSize: '14px', fontWeight: 'normal' }}>(Chế độ chỉ xem)</span>}
                </h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                    {isReadOnly 
                        ? 'Xem lịch đặt thiết bị của các thành viên. Bấm vào ô đã đặt để xem thông tin chi tiết.'
                        : 'Chọn thiết bị và bấm vào các khung giờ trống để đăng ký sử dụng.'}
                </p>
            </div>

            {/* Danh sách thiết bị kết hợp 🌟 4. Trực quan hóa trạng thái thiết bị (Equipment Status Badge) */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px', borderBottom: '1px solid #eee', marginBottom: '20px', alignItems: 'center' }}>
                {equipments.map(eq => {
                    const isSelected = selectedEquip?.id === eq.id;
                    const isBrokenOrMaintenance = eq.status === 'Hỏng' || eq.status === 'Đang bảo trì';

                    let badgeBg = '#dcfce7'; let badgeColor = '#166534'; let statusText = 'Sẵn sàng';
                    if (eq.status === 'Hỏng') { badgeBg = '#fee2e2'; badgeColor = '#991b1b'; statusText = 'Hỏng / Bảo trì'; }
                    else if (eq.status === 'Đang bảo trì') { badgeBg = '#fef3c7'; badgeColor = '#92400e'; statusText = 'Đang bảo trì'; }

                    return (
                        <button key={eq.id} onClick={() => setSelectedEquip(eq)}
                            style={{ 
                                padding: '10px 18px', borderRadius: '25px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 'bold', transition: 'all 0.2s',
                                backgroundColor: isSelected ? '#0056b3' : '#f3f4f6',
                                color: isSelected ? 'white' : '#374151',
                                boxShadow: isSelected ? '0 4px 8px rgba(0,86,179,0.2)' : 'none',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                            <span>{eq.name}</span>
                            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : badgeBg, color: isSelected ? '#ffffff' : badgeColor }}>
                                {statusText}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Điều hướng tuần và 🌟 1. Bộ lọc / Chế độ xem "Lịch của tôi" */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>
                        Tuần: {weekStart.toLocaleDateString('vi-VN')} - {weekDays[6].toLocaleDateString('vi-VN')}
                    </span>
                    
                    {/* Checkbox lọc Lịch của tôi */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#eff6ff', padding: '6px 12px', borderRadius: '20px', border: '1px solid #bfdbfe', fontSize: '13px', fontWeight: '600', color: '#1e40af', cursor: 'pointer' }}>
                        <input 
                            type="checkbox" 
                            checked={showOnlyMyBookings} 
                            onChange={e => setShowOnlyMyBookings(e.target.checked)}
                            style={{ width: '15px', height: '15px', cursor: 'pointer' }} 
                        />
                        ⭐ Chỉ hiển thị lịch của tôi
                    </label>
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', backgroundColor: '#f9fafb', padding: '5px 15px', borderRadius: '20px', border: '1px solid #e5e7eb' }}>
                    <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '16px', color: '#007bff', fontWeight: 'bold' }}>◀</button>
                    <span style={{ color: '#4b5563', fontSize: '14px', fontWeight: 'bold' }}>Chuyển tuần</span>
                    <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '16px', color: '#007bff', fontWeight: 'bold' }}>▶</button>
                </div>
            </div>

            {/* Bảng thời khóa biểu */}
            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e5e7eb', position: 'relative' }}>
                {loading && (
                    <div style={{ 
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                        backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(3px)', 
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 10, gap: '10px' 
                    }}>
                        <div style={{ width: '32px', height: '32px', border: '3px solid rgba(0,86,179,0.2)', borderTopColor: '#0056b3', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                        <span style={{ fontWeight: 'bold', color: '#0056b3', fontSize: '14px' }}>⏳ Đang đồng bộ lịch thiết bị...</span>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                )}
                
                <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'center' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th style={{ width: '70px', borderRight: '1px solid #e5e7eb', borderBottom: '2px solid #e5e7eb', padding: '12px', color: '#6c7280', fontSize: '13px' }}>Giờ</th>
                            {weekDays.map((date, idx) => {
                                const dateStr = formatDateString(date);
                                const isToday = dateStr === todayStr;

                                return (
                                    <th key={idx} style={{ 
                                        borderBottom: '2px solid #e5e7eb', 
                                        borderRight: '1px solid #f3f4f6', 
                                        padding: '12px',
                                        backgroundColor: isToday ? '#eff6ff' : 'transparent'
                                    }}>
                                        <div style={{ fontSize: '12px', color: isToday ? '#2563eb' : '#9ca3af', textTransform: 'uppercase', fontWeight: isToday ? 'bold' : 'normal' }}>
                                            Thứ {idx === 6 ? 'CN' : idx + 2} {isToday && '(Hôm nay)'}
                                        </div>
                                        <div style={{ fontWeight: 'bold', color: isToday ? '#1d4ed8' : '#1f2937', fontSize: '14px', marginTop: '2px' }}>
                                            {date.getDate().toString().padStart(2, '0')}/{(date.getMonth()+1).toString().padStart(2, '0')}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {hours.map(hour => (
                            <tr key={hour}>
                                <td style={{ borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #f1f3f6', color: '#4b5563', fontSize: '13px', fontWeight: 'bold', padding: '10px' }}>{hour}</td>
                                {weekDays.map((date, idx) => {
                                    const dateStr = formatDateString(date);
                                    const isToday = dateStr === todayStr;
                                    const isPast = dateStr < todayStr;

                                    const booking = getBookingForSlot(date, hour);
                                    const isMine = booking?.user_email === currentUserEmail;
                                    
                                    // Xử lý bộ lọc hiển thị lịch của tôi
                                    const isDimmed = showOnlyMyBookings && booking && !isMine;

                                    let isStartSlot = false;
                                    if (booking) {
                                        const bStartHour = new Date(booking.start_time).getHours();
                                        isStartSlot = bStartHour === parseInt(hour);
                                    }
                                    
                                    let bgColor = '#ffffff';
                                    if (booking) {
                                        bgColor = isMine ? '#d1fae5' : '#fee2e2';
                                    } else if (isToday) {
                                        bgColor = '#f0fdf4';
                                    } else if (isPast) {
                                        bgColor = '#f9fafb';
                                    }

                                    return (
                                        <td key={idx} onClick={() => handleSlotClick(date, hour, booking)}
                                            style={{ 
                                                borderRight: '1px solid #f3f4f6', 
                                                borderBottom: '1px solid #f1f3f6', 
                                                cursor: isPast && !booking ? 'not-allowed' : 'pointer', 
                                                height: '55px', 
                                                position: 'relative',
                                                backgroundColor: bgColor,
                                                opacity: (isPast && !booking) || isDimmed ? 0.25 : 1,
                                                transition: 'background-color 0.2s, opacity 0.2s'
                                            }}
                                            onMouseEnter={e => !booking && !isReadOnly && !isPast && (e.currentTarget.style.backgroundColor = '#e2e8f0')}
                                            onMouseLeave={e => !booking && !isReadOnly && !isPast && (e.currentTarget.style.backgroundColor = isToday ? '#f0fdf4' : '#ffffff')}
                                        >
                                            {booking && (
                                                <div style={{
                                                    position: 'absolute', top: '2px', left: '4px', right: '4px', bottom: '2px',
                                                    backgroundColor: isMine ? '#10b981' : '#ef4444', 
                                                    color: 'white', borderRadius: '4px', padding: '4px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '11px', fontWeight: 'bold', textTransform: 'capitalize', textAlign: 'center',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                }}>
                                                    {isStartSlot ? (isMine ? 'Lịch của bạn' : (booking.users?.full_name || 'Đã đặt')) : '⇩'}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}