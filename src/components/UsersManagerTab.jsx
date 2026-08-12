import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

export default function UsersManagerTab({ role }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [updatingEmail, setUpdatingEmail] = useState(null);
    const [deletingEmail, setDeletingEmail] = useState(null);

    const isReadOnly = role === 'Student';
    const ROOT_ADMIN_EMAIL = 'anh.p237957@sis.hust.edu.vn';

    const fetchUsers = async () => {
        setLoading(true);
        // 🌟 SỬA ĐỔI THEO CẤU TRÚC SQL MỚI: Lấy thông tin kèm số điện thoại từ bảng user_private
        const { data, error } = await supabase
            .from('users')
            .select('*, user_private(phone_number)')
            .order('full_name');
            
        if (error) {
            toast.error("Lỗi khi tải danh sách thành viên: " + error.message);
        } else if (data) {
            setUsers(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChangeRole = async (email, currentRole, name) => {
        if (isReadOnly) return;

        if (email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase()) {
            toast.error('Quản trị viên gốc hệ thống không thể bị thay đổi quyền!');
            return;
        }

        let inputOptions = {};
        
        if (role === 'Lecturer') {
            inputOptions = {
                'Admin': 'Quản trị viên (Admin)',
                'Lecturer': 'Giảng viên (Lecturer)',
                'Student': 'Sinh viên (Student)'
            };
        } else if (role === 'Admin') {
            inputOptions = {
                'Admin': 'Quản trị viên (Admin)',
                'Student': 'Sinh viên (Student)'
            };
        } else {
            toast.error('Bạn không có quyền thay đổi vai trò!');
            return;
        }

        const { value: newRole } = await Swal.fire({
            title: `Phân quyền cho ${name}`,
            text: `Chọn vai trò mới cho tài khoản (${email}):`,
            input: 'select',
            inputOptions: inputOptions,
            inputValue: currentRole,
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Xác nhận đổi',
            cancelButtonText: 'Hủy'
        });

        if (newRole && newRole !== currentRole) {
            setUpdatingEmail(email);
            const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('email', email);

            if (error) {
                toast.error("Lỗi khi cập nhật vai trò: " + error.message);
            } else {
                toast.success(`✨ Đã cập nhật vai trò của ${name} thành ${newRole}!`);
                setUsers(users.map(u => u.email === email ? { ...u, role: newRole } : u));
            }
            setUpdatingEmail(null);
        }
    };

    const handleDeleteUser = async (email, name) => {
        if (isReadOnly) return;

        if (email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase()) {
            toast.error('Không thể xóa tài khoản quản trị viên gốc của hệ thống!');
            return;
        }

        Swal.fire({
            title: 'Bạn có chắc chắn?',
            html: `Xóa <b>${name}</b> (${email}) khỏi hệ thống?<br/>Hành động này không thể hoàn tác!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Xóa vĩnh viễn',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                setDeletingEmail(email);
                
                // 🌟 SỬA ĐỔI THEO SQL MỚI: Gọi RPC delete_user_completely để xóa sạch cả auth lẫn public profile
                const { error } = await supabase.rpc('delete_user_completely', { p_email: email });
                    
                if (error) {
                    toast.error("Lỗi khi xóa: " + error.message);
                } else {
                    toast.success("🗑 Đã xóa thành viên thành công!");
                    setUsers(users.filter(u => u.email !== email));
                }
                setDeletingEmail(null);
            }
        });
    };

    return (
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#111827', fontSize: '18px' }}>👥 Danh Sách Thành Viên Phòng Lab</h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                    {isReadOnly 
                        ? 'Thông tin chi tiết các thành viên và sinh viên đang tham gia nghiên cứu (Chế độ chỉ xem).' 
                        : 'Quản lý thông tin chi tiết. Nhấp trực tiếp vào nhãn vai trò để thay đổi quyền hạn hoặc bấm Xóa để loại bỏ tài khoản.'}
                </p>
            </div>

            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: 'white' }}>
                    <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                        <tr>
                            <th style={{ padding: '15px', color: '#495057' }}>Họ tên</th>
                            <th style={{ padding: '15px', color: '#495057' }}>MSSV</th>
                            <th style={{ padding: '15px', color: '#495057' }}>Email trường</th>
                            <th style={{ padding: '15px', color: '#495057' }}>SĐT</th>
                            <th style={{ padding: '15px', color: '#495057' }}>Thuộc Lab / Giảng viên</th>
                            <th style={{ padding: '15px', color: '#495057', width: '160px' }}>Vai trò (Tích hợp đổi quyền)</th>
                            {!isReadOnly && (
                                <th style={{ padding: '15px', color: '#495057', width: '100px', textAlign: 'center' }}>Xóa</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={isReadOnly ? 6 : 7} style={{ padding: '30px', textAlign: 'center', color: '#adb5bd', fontStyle: 'italic' }}>
                                    ⏳ Đang tải dữ liệu thành viên...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={isReadOnly ? 6 : 7} style={{ padding: '30px', textAlign: 'center', color: '#adb5bd', fontStyle: 'italic' }}>
                                    Không có thành viên nào trong cơ sở dữ liệu.
                                </td>
                            </tr>
                        ) : (
                            users.map(u => {
                                const isRootAdmin = u.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase();
                                const isUpdatingThis = updatingEmail === u.email;
                                const isDeletingThis = deletingEmail === u.email;

                                const canDelete = 
                                    isRootAdmin ? false :
                                    role === 'Admin' ? u.role !== 'Admin' : 
                                    role === 'Lecturer' ? u.role === 'Student' : 
                                    false;

                                // Lấy SĐT từ quan hệ user_private (nếu người dùng đã cập nhật)
                                const userPhone = u.user_private?.[0]?.phone_number || u.phone_number || '-';

                                return (
                                    <tr key={u.email} style={{ borderBottom: '1px solid #f1f3f5' }}>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ 
                                                    width: '36px', 
                                                    height: '36px', 
                                                    borderRadius: '50%', 
                                                    backgroundColor: '#eff6ff', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center', 
                                                    color: '#2563eb', 
                                                    fontSize: '14px', 
                                                    fontWeight: 'bold', 
                                                    overflow: 'hidden', 
                                                    border: '1px solid #d1d5db', 
                                                    flexShrink: 0 
                                                }}>
                                                    {u.avatar_url ? (
                                                        <img src={u.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        (u.full_name || u.email).charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <span style={{ fontWeight: '600', color: '#343a40' }}>{u.full_name}</span>
                                            </div>
                                        </td>

                                        <td style={{ padding: '15px', color: '#6c757d' }}>{u.student_id || '-'}</td>
                                        <td style={{ padding: '15px', color: '#0056b3', fontWeight: '500' }}>{u.email}</td>
                                        <td style={{ padding: '15px', color: '#6c757d' }}>{userPhone}</td>
                                        <td style={{ padding: '15px', color: '#495057', fontSize: '14px' }}>{u.supervisor || '-'}</td>
                                        
                                        <td style={{ padding: '15px' }}>
                                            <span 
                                                onClick={() => !isReadOnly && !isRootAdmin && !isUpdatingThis && handleChangeRole(u.email, u.role, u.full_name)}
                                                title={!isReadOnly && !isRootAdmin ? "Nhấp để thay đổi vai trò" : "Tài khoản bảo vệ (Không thể đổi)"}
                                                style={{ 
                                                    padding: '6px 12px', 
                                                    borderRadius: '20px', 
                                                    fontSize: '12px', 
                                                    fontWeight: 'bold', 
                                                    display: 'inline-block', 
                                                    backgroundColor: u.role === 'Admin' ? '#ffe3e3' : (u.role === 'Lecturer' ? '#fff3cd' : '#e0f3ff'), 
                                                    color: u.role === 'Admin' ? '#c92a2a' : (u.role === 'Lecturer' ? '#856404' : '#0056b3'),
                                                    cursor: !isReadOnly && !isRootAdmin && !isUpdatingThis ? 'pointer' : 'default',
                                                    border: !isReadOnly && !isRootAdmin ? '1px dashed #f08c8c' : 'none',
                                                    opacity: isUpdatingThis ? 0.6 : 1
                                                }}
                                            >
                                                {isUpdatingThis ? '⏳ Đang đổi...' : `${u.role} ${!isReadOnly && !isRootAdmin ? '⚙️' : ''}`}
                                            </span>
                                        </td>
                                        
                                        {!isReadOnly && (
                                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                                {canDelete ? (
                                                    <button 
                                                        onClick={() => handleDeleteUser(u.email, u.full_name)} 
                                                        disabled={isDeletingThis}
                                                        style={{ 
                                                            padding: '6px 12px', 
                                                            background: '#dc3545', 
                                                            color: 'white', 
                                                            border: 'none', 
                                                            borderRadius: '6px', 
                                                            cursor: 'pointer', 
                                                            fontSize: '12px', 
                                                            fontWeight: 'bold',
                                                            opacity: isDeletingThis ? 0.6 : 1
                                                        }}
                                                    >
                                                        {isDeletingThis ? '⏳ Xóa...' : 'Xóa'}
                                                    </button>
                                                ) : (
                                                    <span style={{ color: '#adb5bd', fontSize: '12px', fontWeight: '500' }}>
                                                        Vô hiệu
                                                    </span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}