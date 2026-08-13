import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function EquipmentManagerTab() {
    const [equipments, setEquipments] = useState([]);
    const [loading, setLoading] = useState(true);

    // State cho Modal Thêm Thiết Bị
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');

    // 🌟 State cho Modal Chỉnh Sửa Thiết Bị (Edit)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // State quản lý trạng thái loading cục bộ cho hành động Thêm, Sửa và Cập nhật trạng thái
    const [actionLoading, setActionLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null); // Lưu ID thiết bị đang được đổi trạng thái

    const fetchEquipments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('equipments')
            .select('*')
            .order('id');
            
        if (error) {
            toast.error("Lỗi khi tải danh sách thiết bị: " + error.message);
        } else if (data) {
            setEquipments(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEquipments();
    }, []);

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Bình thường' ? 'Hỏng' : 'Bình thường';
        
        setUpdatingId(id); // Bật loading cục bộ cho riêng thiết bị này
        const { error } = await supabase
            .from('equipments')
            .update({ status: newStatus })
            .eq('id', id);
        
        if (error) {
            toast.error("Lỗi khi cập nhật trạng thái: " + error.message);
        } else {
            toast.success(`Đã cập nhật thiết bị thành: ${newStatus}`);
            setEquipments(equipments.map(eq => 
                eq.id === id ? { ...eq, status: newStatus } : eq
            ));
        }
        setUpdatingId(null);
    };

    // Hàm xử lý Thêm thiết bị mới
    const handleAddEquipment = async (e) => {
        e.preventDefault();
        if (!newName.trim()) {
            return toast.error("Vui lòng nhập tên thiết bị!");
        }

        setActionLoading(true); // Bật trạng thái đang lưu
        const { error } = await supabase
            .from('equipments')
            .insert({
                name: newName.trim(),
                description: newDescription.trim(),
                status: 'Bình thường'
            });

        if (error) {
            toast.error("Lỗi khi thêm thiết bị: " + error.message);
        } else {
            toast.success("🎉 Đã thêm thiết bị mới thành công!");
            setIsAddModalOpen(false);
            setNewName('');
            setNewDescription('');
            await fetchEquipments();
        }
        setActionLoading(false); // Tắt trạng thái đang lưu
    };

    // 🌟 Mở Modal Chỉnh Sửa
    const handleOpenEdit = (eq) => {
        setEditingItem(eq);
        setEditName(eq.name);
        setEditDescription(eq.description || '');
        setIsEditModalOpen(true);
    };

    // 🌟 Xử lý Cập nhật Thiết Bị
    const handleUpdateEquipment = async (e) => {
        e.preventDefault();
        if (!editName.trim()) {
            return toast.error("Vui lòng nhập tên thiết bị!");
        }

        setActionLoading(true);
        const { error } = await supabase
            .from('equipments')
            .update({
                name: editName.trim(),
                description: editDescription.trim()
            })
            .eq('id', editingItem.id);

        if (error) {
            toast.error("Lỗi khi cập nhật thiết bị: " + error.message);
        } else {
            toast.success("✨ Cập nhật thông tin thiết bị thành công!");
            setIsEditModalOpen(false);
            setEditingItem(null);
            await fetchEquipments();
        }
        setActionLoading(false);
    };

    // Hàm Xóa thiết bị (Dành cho Admin)
    const handleDeleteEquipment = async (id, name) => {
        Swal.fire({
            title: 'Xóa thiết bị này?',
            text: `Bạn có chắc chắn muốn xóa "${name}" khỏi hệ thống không?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { error } = await supabase
                    .from('equipments')
                    .delete()
                    .eq('id', id);

                if (error) {
                    toast.error("Lỗi khi xóa thiết bị: " + error.message);
                } else {
                    toast.success("🗑️ Đã xóa thiết bị thành công!");
                    setEquipments(equipments.filter(eq => eq.id !== id));
                }
            }
        });
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ overflowX: 'auto', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', backgroundColor: 'white' }}>
                <div style={{ padding: '20px 25px', borderBottom: '2px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#343a40', fontSize: '18px' }}>🛠 Quản lý Thiết bị Phòng Lab</h3>
                        <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
                            Quản trị viên cập nhật trạng thái, chỉnh sửa thông tin hoặc thêm mới thiết bị vào hệ thống.
                        </p>
                    </div>
                    {/* Nút mở Popup Thêm Thiết Bị */}
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        style={{ padding: '10px 18px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}
                    >
                        + Thêm Thiết Bị Mới
                    </button>
                </div>
                
                <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                        <tr>
                            <th style={{ padding: '15px 25px', color: '#495057' }}>Tên thiết bị</th>
                            <th style={{ padding: '15px', color: '#495057' }}>Mô tả chi tiết</th>
                            <th style={{ padding: '15px', color: '#495057', width: '130px' }}>Trạng thái</th>
                            <th style={{ padding: '15px 25px', color: '#495057', width: '230px', textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#adb5bd', fontStyle: 'italic' }}>
                                    ⏳ Đang tải dữ liệu thiết bị...
                                </td>
                            </tr>
                        ) : equipments.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#adb5bd', fontStyle: 'italic' }}>
                                    Chưa có thiết bị nào trong cơ sở dữ liệu.
                                </td>
                            </tr>
                        ) : (
                            equipments.map(eq => (
                                <tr key={eq.id} style={{ borderBottom: '1px solid #f1f3f5' }}>
                                    <td style={{ padding: '15px 25px', fontWeight: '600', color: '#343a40' }}>{eq.name}</td>
                                    <td style={{ padding: '15px', fontSize: '14px', color: '#6c757d', lineHeight: '1.5' }}>
                                        {eq.description || 'Không có mô tả'}
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{ 
                                            padding: '6px 12px', 
                                            borderRadius: '20px', 
                                            fontSize: '12px', 
                                            fontWeight: 'bold', 
                                            display: 'inline-block',
                                            backgroundColor: eq.status === 'Hỏng' ? '#ffe3e3' : '#d3f9d8', 
                                            color: eq.status === 'Hỏng' ? '#c92a2a' : '#2b8a3e' 
                                        }}>
                                            {eq.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 25px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                            {/* Nút báo hỏng / sửa xong có trạng thái loading cục bộ */}
                                            <button 
                                                onClick={() => toggleStatus(eq.id, eq.status)} 
                                                disabled={updatingId === eq.id}
                                                style={{ 
                                                    padding: '8px 10px', 
                                                    background: eq.status === 'Hỏng' ? '#28a745' : '#eab308', 
                                                    color: 'white', 
                                                    border: 'none', 
                                                    borderRadius: '6px', 
                                                    cursor: 'pointer', 
                                                    fontSize: '12px', 
                                                    fontWeight: 'bold',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                    opacity: updatingId === eq.id ? 0.7 : 1
                                                }}
                                                title="Đổi trạng thái thiết bị"
                                            >
                                                {updatingId === eq.id ? '⏳...' : (eq.status === 'Bình thường' ? '🚨 Báo hỏng' : '✅ Đã sửa')}
                                            </button>

                                            {/* 🌟 Nút Chỉnh Sửa */}
                                            <button 
                                                onClick={() => handleOpenEdit(eq)}
                                                style={{ 
                                                    padding: '8px 10px', 
                                                    background: '#d97706', 
                                                    color: 'white', 
                                                    border: 'none', 
                                                    borderRadius: '6px', 
                                                    cursor: 'pointer', 
                                                    fontSize: '12px', 
                                                    fontWeight: 'bold',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                                title="Chỉnh sửa thông tin thiết bị"
                                            >
                                                ✏️ Sửa
                                            </button>

                                            {/* Nút Xóa thiết bị */}
                                            <button 
                                                onClick={() => handleDeleteEquipment(eq.id, eq.name)} 
                                                style={{ 
                                                    padding: '8px 10px', 
                                                    background: '#dc3545', 
                                                    color: 'white', 
                                                    border: 'none', 
                                                    borderRadius: '6px', 
                                                    cursor: 'pointer', 
                                                    fontSize: '12px', 
                                                    fontWeight: 'bold',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                                title="Xóa thiết bị khỏi hệ thống"
                                            >
                                                🗑️ Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL THÊM THIẾT BỊ MỚI */}
            {isAddModalOpen && (
                <div style={{ position: 'fixed', top: '0', left: '0', right: '0', bottom: '0', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: '1000', padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '500px', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#111827', fontSize: '18px' }}>➕ Thêm Thiết Bị Mới</h3>
                            <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold', color: '#6b7280' }}>✕</button>
                        </div>

                        <form onSubmit={handleAddEquipment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Tên thiết bị: *</label>
                                <input 
                                    type="text" 
                                    value={newName} 
                                    onChange={e => setNewName(e.target.value)} 
                                    placeholder="VD: Lò nung 1200, Máy ép..." 
                                    required 
                                    style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} 
                                />
                            </div>

                            <div>
                                <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Mô tả chi tiết:</label>
                                <textarea 
                                    value={newDescription} 
                                    onChange={e => setNewDescription(e.target.value)} 
                                    placeholder="Ghi chú về công năng, dải nhiệt độ, lưu ý sử dụng..." 
                                    rows="3"
                                    style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }} 
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ padding: '10px 18px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Hủy</button>
                                {/* 🌟 Nút lưu có hiệu ứng loading */}
                                <button type="submit" disabled={actionLoading} style={{ padding: '10px 18px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', opacity: actionLoading ? 0.7 : 1 }}>
                                    {actionLoading ? '⏳ Đang lưu...' : 'Lưu thiết bị'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= 🌟 MODAL CHỈNH SỬA THIẾT BỊ ================= */}
            {isEditModalOpen && (
                <div style={{ position: 'fixed', top: '0', left: '0', right: '0', bottom: '0', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: '1000', padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '500px', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#111827', fontSize: '18px' }}>✏️ Chỉnh Sửa Thông Tin Thiết Bị</h3>
                            <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold', color: '#6b7280' }}>✕</button>
                        </div>

                        <form onSubmit={handleUpdateEquipment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Tên thiết bị: *</label>
                                <input 
                                    type="text" 
                                    value={editName} 
                                    onChange={e => setEditName(e.target.value)} 
                                    required 
                                    style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} 
                                />
                            </div>

                            <div>
                                <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Mô tả chi tiết:</label>
                                <textarea 
                                    value={editDescription} 
                                    onChange={e => setEditDescription(e.target.value)} 
                                    rows="3"
                                    style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }} 
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding: '10px 18px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Hủy</button>
                                <button type="submit" disabled={actionLoading} style={{ padding: '10px 18px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', opacity: actionLoading ? 0.7 : 1 }}>
                                    {actionLoading ? '⏳ Đang cập nhật...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}