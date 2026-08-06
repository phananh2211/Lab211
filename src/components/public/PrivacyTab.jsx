export default function PrivacyTab({ onBack }) {
    const containerStyle = { padding: '30px', fontFamily: 'system-ui, sans-serif', maxHeight: '75vh', overflowY: 'auto' };
    const headingStyle = { color: '#1f2937', marginBottom: '20px', fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px' };
    const textStyle = { color: '#4b5563', lineHeight: '1.8', marginBottom: '25px', fontSize: '15px', textAlign: 'justify' };
    const sectionStyle = { backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };
    const titleStyle = { margin: '0 0 12px 0', color: '#111827', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' };
    const buttonStyle = { padding: '12px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' };

    return (
        <div style={containerStyle}>
            <h2 style={headingStyle}>🔒 Chính Sách Bảo Mật (Privacy Policy)</h2>
            <p style={textStyle}>
                Tại Lab 211, chúng tôi coi trọng quyền riêng tư và cam kết bảo vệ dữ liệu cá nhân cũng như các thành quả nghiên cứu khoa học của bạn. Chính sách này minh bạch hóa cách thức chúng tôi thu thập, lưu trữ và bảo vệ thông tin khi bạn sử dụng hệ thống.
            </p>

            <div style={sectionStyle}>
                <h3 style={titleStyle}><span>🛡️</span> 1. Thu thập & Mục đích sử dụng dữ liệu</h3>
                <p style={{ margin: '0 0 10px 0', color: '#4b5563', fontSize: '14.5px', lineHeight: '1.8' }}>
                    Hệ thống tuân thủ nguyên tắc thu thập dữ liệu tối thiểu. Các thông tin được ghi nhận bao gồm:
                </p>
                <ul style={{ color: '#4b5563', fontSize: '14.5px', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
                    <li><b>Thông tin định danh:</b> Họ tên, Email trường, MSSV, và số điện thoại liên lạc nhằm xác thực tư cách thành viên Lab.</li>
                    <li><b>Dữ liệu hoạt động:</b> Lịch sử đăng nhập, lịch sử đặt thiết bị và các yêu cầu báo cáo, nhằm phục vụ công tác quản lý lịch trình và phân bổ tài nguyên hợp lý tại phòng thí nghiệm.</li>
                </ul>
            </div>

            <div style={sectionStyle}>
                <h3 style={titleStyle}><span>🔐</span> 2. Tiêu chuẩn Lưu trữ & Bảo mật Hệ thống</h3>
                <ul style={{ color: '#4b5563', fontSize: '14.5px', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
                    <li><b>Hạ tầng đám mây an toàn:</b> Toàn bộ cơ sở dữ liệu được lưu trữ và mã hóa trên nền tảng Supabase — đáp ứng các tiêu chuẩn bảo mật quốc tế. Các truy vấn dữ liệu được bảo vệ bởi hệ thống chính sách bảo mật hàng dọc (Row Level Security).</li>
                    <li><b>Mã hóa truy cập:</b> Hệ thống sử dụng giao thức HTTPS/SSL để mã hóa đường truyền, đồng thời yêu cầu xác thực đa yếu tố (MFA - Authenticator) để ngăn chặn các truy cập trái phép.</li>
                </ul>
            </div>

            <div style={sectionStyle}>
                <h3 style={titleStyle}><span>🤝</span> 3. Cam kết Không chia sẻ Dữ liệu</h3>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '14.5px', lineHeight: '1.8' }}>
                    Chúng tôi cam kết <b>không mua bán, trao đổi hoặc chia sẻ</b> thông tin cá nhân và số liệu nghiên cứu của người dùng cho bất kỳ bên thứ ba nào. Dữ liệu chỉ được truy cập bởi Quản trị viên (Admin) và Cán bộ quản lý Lab với mục đích duy nhất là vận hành môi trường học thuật nội bộ.
                </p>
            </div>

            <div style={sectionStyle}>
                <h3 style={titleStyle}><span>👤</span> 4. Quyền kiểm soát của Người dùng</h3>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '14.5px', lineHeight: '1.8' }}>
                    Bất cứ lúc nào, bạn đều có quyền truy cập vào mục <i>Cài đặt tài khoản</i> để xem, cập nhật hoặc sửa đổi thông tin cá nhân (như số điện thoại, ảnh đại diện). Đối với yêu cầu vô hiệu hóa hoặc xóa vĩnh viễn tài khoản sau khi tốt nghiệp, bạn có thể gửi yêu cầu trực tiếp cho Giảng viên phụ trách Lab để được hỗ trợ xử lý ngay lập tức.
                </p>
            </div>

            <button 
                onClick={onBack} 
                style={buttonStyle}
                onMouseEnter={e => e.target.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={e => e.target.style.backgroundColor = '#2563eb'}
            >
                ← Quay lại trang chính
            </button>
        </div>
    );
}