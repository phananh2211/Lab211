import React, { useState, useEffect } from 'react';

// 🌟 Import đầy đủ các tab module cho giảng viên
import ProjectManagementTab from './components/ProjectManagementTab';
import UsersManagerTab from './components/UsersManagerTab';
import ScheduleTab from './components/ScheduleTab';
import ProcurementTab from './components/ProcurementTab';
import DocumentsTab from './components/DocumentsTab';
import InternalTransferTab from './components/InternalTransferTab';

export default function LecturerDashboard({ session, onNavigate }) {
    // 1. ĐỌC THAM SỐ TRÊN THANH ĐỊA CHỈ URL
    const queryParams = new URLSearchParams(window.location.search);
    const currentView = queryParams.get('view');

    // Quản lý state loading thích ứng và trạng thái lỗi mạng
    const [loadingView, setLoadingView] = useState(null);
    const [hasError, setHasError] = useState(false);

    // Tự động tắt loading ngay khi currentView trên URL đã cập nhật xong hoàn toàn
    useEffect(() => {
        setLoadingView(null);
        setHasError(false);
    }, [currentView]);

    const handleNavigation = (view) => {
        setLoadingView(view); // Bật hiệu ứng loading ngay khi click
        try {
            onNavigate(view); // Gọi hàm chuyển trang của App.jsx
        } catch (err) {
            console.error("Lỗi chuyển hướng:", err);
            setHasError(true);
            setLoadingView(null);
        }
    };

    // Style cho nút quay lại
    const backBtn = {
        marginBottom: '15px', 
        padding: '8px 14px', 
        backgroundColor: '#e5e7eb', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'background-color 0.2s'
    };

    // Nếu xảy ra lỗi mạng khi tải tab, hiển thị giao diện thông báo và nút thử lại
    if (hasError) {
        return (
            <div className="fade-in-box" style={{ padding: '40px', textAlign: 'center' }}>
                <h3 style={{ color: '#ef4444', marginBottom: '10px' }}>⚠️ Không thể tải dữ liệu mô-đun</h3>
                <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '20px' }}>Đường truyền mạng của bạn có thể đang gặp sự cố.</p>
                <button 
                    onClick={() => { setHasError(false); handleNavigation('dashboard'); }}
                    style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    🔄 Thử lại kết nối
                </button>
            </div>
        );
    }

    // 2. NẾU ĐANG CHỌN 1 CHỨC NĂNG CỤ THỂ, HIỂN THỊ NÓ VÀ KÈM NÚT "QUAY LẠI"
    if (currentView === 'projects') return <div className="fade-in-box"><button onClick={() => handleNavigation('dashboard')} style={backBtn}>{loadingView === 'dashboard' ? '⏳ Đang xử lý...' : '⬅ Quay lại Menu'}</button><ProjectManagementTab session={session} role="Lecturer" /></div>;
    if (currentView === 'procurements') return <div className="fade-in-box"><button onClick={() => handleNavigation('dashboard')} style={backBtn}>{loadingView === 'dashboard' ? '⏳ Đang xử lý...' : '⬅ Quay lại Menu'}</button><ProcurementTab session={session} role="Lecturer" /></div>;
    if (currentView === 'students') return <div className="fade-in-box"><button onClick={() => handleNavigation('dashboard')} style={backBtn}>{loadingView === 'dashboard' ? '⏳ Đang xử lý...' : '⬅ Quay lại Menu'}</button><UsersManagerTab role="Lecturer" /></div>;
    if (currentView === 'schedule') return <div className="fade-in-box"><button onClick={() => handleNavigation('dashboard')} style={backBtn}>{loadingView === 'dashboard' ? '⏳ Đang xử lý...' : '⬅ Quay lại Menu'}</button><ScheduleTab session={session} role="Lecturer" /></div>;
    if (currentView === 'documents') return <div className="fade-in-box"><button onClick={() => handleNavigation('dashboard')} style={backBtn}>{loadingView === 'dashboard' ? '⏳ Đang xử lý...' : '⬅ Quay lại Menu'}</button><DocumentsTab session={session} role="Lecturer" /></div>;
    if (currentView === 'internal_transfers') return <div className="fade-in-box"><button onClick={() => handleNavigation('dashboard')} style={backBtn}>{loadingView === 'dashboard' ? '⏳ Đang xử lý...' : '⬅ Quay lại Menu'}</button><InternalTransferTab session={session} /></div>;

    // 3. MENU CHÍNH DASHBOARD
    const buttonStyle = {
        padding: '16px',
        backgroundColor: '#f3f4f6',
        border: '1px solid #d1d5db',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: 'bold',
        color: '#1f2937',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    return (
        <div className="fade-in-box" style={{ marginTop: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <h2 style={{ color: '#0056b3', margin: '0 0 20px 0' }}>🎓 Trung tâm Quản trị Giảng viên</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <button 
                    onClick={() => handleNavigation('projects')} 
                    style={buttonStyle} 
                    disabled={loadingView !== null}
                >
                    <span>📋 Quản lý Đề tài & Giao việc</span>
                    {loadingView === 'projects' && <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600' }}>⏳ Đang mở...</span>}
                </button>
                
                <button 
                    onClick={() => handleNavigation('procurements')} 
                    style={buttonStyle} 
                    disabled={loadingView !== null}
                >
                    <span>🛒 Phê duyệt Mua sắm</span>
                    {loadingView === 'procurements' && <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600' }}>⏳ Đang mở...</span>}
                </button>
                
                <button 
                    onClick={() => handleNavigation('students')} 
                    style={buttonStyle} 
                    disabled={loadingView !== null}
                >
                    <span>👥 Danh sách Thành viên / Sinh viên</span>
                    {loadingView === 'students' && <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600' }}>⏳ Đang mở...</span>}
                </button>
                
                <button 
                    onClick={() => handleNavigation('schedule')} 
                    style={buttonStyle} 
                    disabled={loadingView !== null}
                >
                    <span>📅 Lịch Đặt Thiết Bị (Chỉ xem)</span>
                    {loadingView === 'schedule' && <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600' }}>⏳ Đang mở...</span>}
                </button>
                
                <button 
                    onClick={() => handleNavigation('documents')} 
                    style={buttonStyle} 
                    disabled={loadingView !== null}
                >
                    <span>📚 Tài liệu nội bộ</span>
                    {loadingView === 'documents' && <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600' }}>⏳ Đang mở...</span>}
                </button>

                <button 
                    onClick={() => handleNavigation('internal_transfers')} 
                    style={buttonStyle} 
                    disabled={loadingView !== null}
                >
                    <span>💸 Chuyển khoản Nội bộ</span>
                    {loadingView === 'internal_transfers' && <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600' }}>⏳ Đang mở...</span>}
                </button>
            </div>
        </div>
    );
}