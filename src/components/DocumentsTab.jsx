import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

export default function DocumentsTab({ session, role }) {
    const [materials, setMaterials] = useState([]);
    const [activeCategory, setActiveCategory] = useState('Đại cương');
    const [loading, setLoading] = useState(true);

    // 🌟 State quản lý trạng thái loading cục bộ cho từng hành động
    const [actionLoading, setActionLoading] = useState(false);

    // State cho form thêm tài liệu mới
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Đại cương');
    const [description, setDescription] = useState('');
    const [driveLink, setDriveLink] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    // State cho form chỉnh sửa tài liệu
    const [editingItem, setEditingItem] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editDriveLink, setEditDriveLink] = useState('');

    const categories = ['Đại cương', 'Cơ sở ngành', 'Chuyên ngành', 'References'];

    useEffect(() => {
        fetchMaterials();

        const channel = supabase
            .channel('public:learning_materials')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'learning_materials' }, () => {
                fetchMaterials();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchMaterials = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('learning_materials')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            toast.error("Lỗi khi tải tài liệu: " + error.message);
        } else if (data) {
            setMaterials(data);
        }
        setLoading(false);
    };

    const handleAddMaterial = async (e) => {
        e.preventDefault();
        if (!title || !driveLink) {
            toast.error('Vui lòng điền đầy đủ tiêu đề và đường dẫn (Link)!');
            return;
        }

        setActionLoading(true);
        const { error } = await supabase.from('learning_materials').insert([
            { title, category, description, drive_link: driveLink }
        ]);

        if (error) {
            toast.error('Lỗi khi thêm tài liệu: ' + error.message);
        } else {
            toast.success('📚 Thêm tài liệu thành công!');
            setTitle('');
            setDescription('');
            setDriveLink('');
            setShowAddForm(false);
            await fetchMaterials(); // Làm mới dữ liệu ngay lập tức
        }
        setActionLoading(false);
    };

    const handleOpenEdit = (item) => {
        setEditingItem(item);
        setEditTitle(item.title);
        setEditCategory(item.category);
        setEditDescription(item.description || '');
        setEditDriveLink(item.drive_link);
    };

    const handleUpdateMaterial = async (e) => {
        e.preventDefault();
        if (!editTitle || !editDriveLink) {
            toast.error('Vui lòng điền đầy đủ tiêu đề và đường dẫn (Link)!');
            return;
        }

        setActionLoading(true);
        const { error } = await supabase
            .from('learning_materials')
            .update({
                title: editTitle,
                category: editCategory,
                description: editDescription,
                drive_link: editDriveLink
            })
            .eq('id', editingItem.id);

        if (error) {
            toast.error('Lỗi khi cập nhật tài liệu: ' + error.message);
        } else {
            toast.success('✨ Cập nhật tài liệu thành công!');
            setEditingItem(null);
            await fetchMaterials(); // Làm mới dữ liệu ngay lập tức
        }
        setActionLoading(false);
    };

    const handleDelete = async (id, itemTitle) => {
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            html: `Xóa tài liệu <b>${itemTitle}</b> khỏi hệ thống?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Xóa vĩnh viễn',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { error } = await supabase
                    .from('learning_materials')
                    .delete()
                    .eq('id', id);

                if (error) {
                    toast.error('Bạn không có quyền xóa trực tiếp tài liệu này! (Yêu cầu quyền Admin hoặc Lecturer).');
                } else {
                    toast.success('🗑 Đã xóa tài liệu thành công!');
                    setMaterials(prev => prev.filter(m => m.id !== id));
                }
            }
        });
    };

    return (
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#111827', fontSize: '18px' }}>📚 Thư Viện Tài Liệu & Bài Báo Nghiên Cứu</h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                        Hệ thống tổng hợp giáo trình, tài liệu chuyên ngành và các bài báo khoa học (Papers).
                    </p>
                </div>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{ padding: '10px 18px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                >
                    {showAddForm ? '✕ Đóng form' : '+ Đóng góp / Thêm tài liệu'}
                </button>
            </div>

            {/* Form thêm tài liệu mới */}
            {showAddForm && (
                <form onSubmit={handleAddMaterial} style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #e5e7eb' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#374151' }}>Thêm tài liệu / Bài báo mới</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#4b5563' }}>Tiêu đề tài liệu/bài báo:</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ví dụ: Giáo trình A1 / Tên bài báo..." required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#4b5563' }}>Danh mục:</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', backgroundColor: 'white' }}>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#4b5563' }}>Mô tả ngắn (Authors, tạp chí, năm...):</label>
                        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tổng hợp giáo trình, hoặc thông tin DOI, Tác giả..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#4b5563' }}>Đường dẫn (Google Drive / Link Paper URL):</label>
                        <input type="url" value={driveLink} onChange={(e) => setDriveLink(e.target.value)} placeholder="https://drive.google.com/... hoặc URL bài báo" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                    </div>
                    {/* 🌟 Nút bấm có trạng thái loading cục bộ */}
                    <button type="submit" disabled={actionLoading} style={{ padding: '10px 20px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', opacity: actionLoading ? 0.7 : 1 }}>
                        {actionLoading ? '⏳ Đang lưu...' : 'Lưu tài liệu'}
                    </button>
                </form>
            )}

            {/* Form chỉnh sửa tài liệu */}
            {editingItem && (
                <form onSubmit={handleUpdateMaterial} style={{ background: '#fffbeb', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #fcd34d' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#b45309' }}>Chỉnh sửa thông tin tài liệu</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#4b5563' }}>Tiêu đề tài liệu/bài báo:</label>
                            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#4b5563' }}>Danh mục:</label>
                            <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', backgroundColor: 'white' }}>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#4b5563' }}>Mô tả ngắn:</label>
                        <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#4b5563' }}>Đường dẫn (Google Drive / Link Paper URL):</label>
                        <input type="url" value={editDriveLink} onChange={(e) => setEditDriveLink(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {/* 🌟 Nút bấm cập nhật có trạng thái loading cục bộ */}
                        <button type="submit" disabled={actionLoading} style={{ padding: '10px 20px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', opacity: actionLoading ? 0.7 : 1 }}>
                            {actionLoading ? '⏳ Đang cập nhật...' : 'Cập nhật'}
                        </button>
                        <button type="button" onClick={() => setEditingItem(null)} style={{ padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Hủy</button>
                    </div>
                </form>
            )}
            
            {/* Thanh chuyển đổi danh mục tab */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', overflowX: 'auto' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: activeCategory === cat ? '#2563eb' : '#f3f4f6',
                            color: activeCategory === cat ? 'white' : '#374151',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Danh sách tài liệu thuộc danh mục được chọn */}
            <div style={{ display: 'grid', gap: '15px' }}>
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#adb5bd', padding: '30px', fontStyle: 'italic' }}>⏳ Đang tải dữ liệu thư viện...</p>
                ) : materials.filter(item => item.category === activeCategory).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
                        <p style={{ color: '#6b7280', margin: '0 0 10px 0' }}>Chưa có tài liệu nào trong danh mục <b>{activeCategory}</b>.</p>
                        <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>Hãy bấm nút "Đóng góp / Thêm tài liệu" ở góc trên để thêm link đầu tiên!</p>
                    </div>
                ) : (
                    materials
                        .filter(item => item.category === activeCategory)
                        .map(item => (
                            <div key={item.id} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                                <div style={{ maxWidth: '65%' }}>
                                    <h4 style={{ margin: '0 0 5px 0', color: '#111827', fontSize: '16px' }}>{item.title}</h4>
                                    <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>{item.description || 'Không có mô tả'}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    {item.drive_link && (
                                        <a 
                                            href={item.drive_link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ padding: '8px 14px', backgroundColor: '#059669', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}
                                        >
                                            Truy cập Link ↗
                                        </a>
                                    )}
                                    
                                    <button 
                                        onClick={() => handleOpenEdit(item)}
                                        style={{ padding: '8px 12px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                                    >
                                        Sửa
                                    </button>

                                    {(role === 'Admin' || role === 'Lecturer') && (
                                        <button 
                                            onClick={() => handleDelete(item.id, item.title)}
                                            style={{ padding: '8px 12px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                                        >
                                            Xóa
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                )}
            </div>
        </div>
    );
}