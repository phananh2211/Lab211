import React, { useState, useEffect } from 'react';

// 🌟 Cập nhật đường dẫn import từ thư mục components (Bổ sung InternalTransferTab)
import EquipmentManagerTab from './components/EquipmentManagerTab';
import UsersManagerTab from './components/UsersManagerTab';
import ScheduleTab from './components/ScheduleTab';
import ProjectManagementTab from './components/ProjectManagementTab';
import ProcurementTab from './components/ProcurementTab';
import DocumentsTab from './components/DocumentsTab';
import InternalTransferTab from './components/InternalTransferTab';

export default function AdminDashboard({ session, onNavigate }) {
    // 1. ĐỌC THAM SỐ TRÊN THANH ĐỊA CHỈ URL
    const queryParams = new URLSearchParams(window.location.search);
    const currentView = queryParams.get('view');

    // 🌟 Quản lý state loading thích ứng và trạng thái lỗi mạng
    const [loadingView, setLoadingView] = useState(null);
    const [hasError, setHasError] = useState(false);

    // Tự động tắt loading ngay khi currentView trên URL đã cập nhật xong hoàn toàn
    useEffect(() => {
        setLoadingView(null);
        setHasError(false);
    }, [currentView]);

    // 🌟 Hàm tiện ích tự động thử lại (Retry) khi có sự cố mạng chập chờn
    const retryAsync = async (fn, retries = 3, delay = 1000) => {
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (err) {
                if (i === retries - 1) throw err;
                await new Promise(res => setTimeout(res, delay));
            }
        }
    };

    const handleNavigation = (view) => {
        setLoadingView(view); // Kích hoạt hiệu ứng chữ "Đang mở..." ngay lập tức
        try {
            onNavigate(view);     // Gọi hàm điều hướng của App.jsx
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
                    style={{ padding: '10px 20px', backgroundColor: '#d9534f', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    🔄 Thử lại kết nối
                </button>
            </div>
        );
    }

    // 2. NẾU ĐANG CHỌN 1 CHỨC NĂNG CỤ THỂ, HIỂN THỊ NÓ VÀ KÈM NÚT "QUAY LẠI" (KÈM ANIMATION FADE-IN)
    if (currentView === 'equipments') return <div className="fade-in-box"><button onClick={() => handleNavigation('dashboard')} style={backBtn}>{loadingView === 'dashboard' ? '⏳ Đang xử lý...' : '⬅ Quay lại Menu'}</button><EquipmentManagerTab retryAsync={retryAsync} /></div>;
    if (currentView === 'users') return <div className="fade-in-box"><button onClick={() => handleNavigation('dashboard')} style={backBtn}>{loadingView === 'dashboard' ? '⏳ Đang xử lý...' : '⬅ Quay lại Menu'}</button><UsersManagerTab role="Admin" retryAsync={retryAsync} /></div>;
    if (currentView === 'schedule') return <div className="fade-in-box"><button onClick={() => handleNavigation('dashboard')} style={backBtn}>{loadingView === 'dashboard' ? '⏳ Đang xử lý...' : '⬅ Quay lại Menu'}</button><ScheduleTab session={session} role="Admin" retryAsync={retryAsync} /></div>;
    if (currentView === 'projects') return <div className="fade-in-box"><button onClick={() => handleNavigation('dashboard')} style={backBtn}>{loadingView === 'dashboard' ? '⏳ Đang xử lý...' : '⬅ Quay lại Menu'}</button><ProjectManagementTab session={session} role="Admin" retryAsync={retryAsync} /></div>;
    if (currentView === 'procurements') return <div className="fade-in-box"><button onClick={() => handleNavigation('dashboard')} style={backBtn}>{loadingView === 'dashboard' ? '⏳ Đang xử lý...' : '⬅ Quay lại Menu'}</button><ProcurementTab session={session} role="Admin" retryAsync={retryAsync} /></div>;
    if (currentView === 'documents') return <div className="fade-in-box"><button onClick={() => handleNavigation('dashboard')} style={backBtn}>{loadingView === 'dashboard' ? '⏳ Đang xử lý...' : '⬅ Quay lại Menu'}</button><DocumentsTab session={session} role="Admin" retryAsync={retryAsync} /></div>;
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
            <h2 style={{ color: '#d9534f', margin: '0 0 20px 0' }}>⚙️ Trung tâm Quản trị Admin</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <button 
                    onClick={() => handleNavigation('equipments')} 
                    style={buttonStyle}
                    disabled={loadingView !== null}
                >
                    <span>🛠 Quản lý Thiết bị</span>
                    {loadingView === 'equipments' && <span style={{ fontSize: '13px', color: '#d9534f', fontWeight: '600' }}>⏳ Đang mở...</span>}
                </button>
                
                <button 
                    onClick={() => handleNavigation('users')} 
                    style={buttonStyle}
                    disabled={loadingView !== null}
                >
                    <span>👥 Quản lý Thành viên</span>
                    {loadingView === 'users' && <span style={{ fontSize: '13px', color: '#d9534f', fontWeight: '600' }}>⏳ Đang mở...</span>}
                </button>
                
                <button 
                    onClick={() => handleNavigation('schedule')} 
                    style={buttonStyle}
                    disabled={loadingView !== null}
                >
                    <span>📅 Lịch Đặt Thiết Bị</span>
                    {loadingView === 'schedule' && <span style={{ fontSize: '13px', color: '#d9534f', fontWeight: '600' }}>⏳ Đang mở...</span>}
                </button>
                
                <button 
                    onClick={() => handleNavigation('projects')} 
                    style={buttonStyle}
                    disabled={loadingView !== null}
                >
                    <span>🎓 Khai báo Đề tài & Công việc</span>
                    {loadingView === 'projects' && <span style={{ fontSize: '13px', color: '#d9534f', fontWeight: '600' }}>⏳ Đang mở...</span>}
                </button>
                
                <button 
                    onClick={() => handleNavigation('procurements')} 
                    style={buttonStyle}
                    disabled={loadingView !== null}
                >
                    <span>🛒 Phê duyệt Mua sắm</span>
                    {loadingView === 'procurements' && <span style={{ fontSize: '13px', color: '#d9534f', fontWeight: '600' }}>⏳ Đang mở...</span>}
                </button>
                
                <button 
                    onClick={() => handleNavigation('documents')} 
                    style={buttonStyle}
                    disabled={loadingView !== null}
                >
                    <span>📚 Tài liệu nội bộ</span>
                    {loadingView === 'documents' && <span style={{ fontSize: '13px', color: '#d9534f', fontWeight: '600' }}>⏳ Đang mở...</span>}
                </button>

                <button 
                    onClick={() => handleNavigation('internal_transfers')} 
                    style={buttonStyle}
                    disabled={loadingView !== null}
                >
                    <span>💸 Chuyển khoản Nội bộ</span>
                    {loadingView === 'internal_transfers' && <span style={{ fontSize: '13px', color: '#d9534f', fontWeight: '600' }}>⏳ Đang mở...</span>}
                </button>
            </div>
        </div>
    );
}