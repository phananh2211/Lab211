export default function TermsTab({ onBack }) {
    const containerStyle = { padding: '30px', fontFamily: 'system-ui, sans-serif', maxHeight: '75vh', overflowY: 'auto' };
    const headingStyle = { color: '#1f2937', marginBottom: '20px', fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px' };
    const textStyle = { color: '#4b5563', lineHeight: '1.8', marginBottom: '25px', fontSize: '15px', textAlign: 'justify' };
    const sectionStyle = { backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };
    const titleStyle = { margin: '0 0 12px 0', color: '#111827', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' };
    const buttonStyle = { padding: '12px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' };

    return (
        <div style={containerStyle}>
            <h2 style={headingStyle}>📜 Điều Khoản Sử Dụng (Terms of Use)</h2>
            <p style={textStyle}>
                Chào mừng bạn đến với <b>Hệ thống Quản lý Lab 211</b>. Bằng việc đăng ký tài khoản và truy cập vào hệ thống, bạn đồng ý tuân thủ các quy định và điều khoản dưới đây. Xin vui lòng đọc kỹ để đảm bảo quyền lợi và trách nhiệm của bạn trong quá trình sử dụng.
            </p>

            <div style={sectionStyle}>
                <h3 style={titleStyle}><span>1️⃣</span> Quy định về Tài khoản & Định danh</h3>
                <ul style={{ color: '#4b5563', fontSize: '14.5px', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
                    <li><b>Email nội bộ:</b> Hệ thống chỉ chấp nhận tài khoản đăng ký bằng email chính thức của Đại học Bách khoa Hà Nội (định dạng <i>@hust.edu.vn</i> đối với cán bộ/giảng viên và <i>@sis.hust.edu.vn</i> đối với sinh viên/học viên).</li>
                    <li><b>Bảo mật thông tin:</b> Người dùng tự chịu trách nhiệm bảo mật mật khẩu và mã xác thực đa yếu tố (MFA). Mọi hành vi chia sẻ, cho mượn tài khoản để người ngoài truy cập hệ thống đặt lịch hoặc dữ liệu lab đều bị nghiêm cấm.</li>
                </ul>
            </div>

            <div style={sectionStyle}>
                <h3 style={titleStyle}><span>2️⃣</span> Quy định Vận hành & Sử dụng Thiết bị (Tòa nhà C5)</h3>
                <ul style={{ color: '#4b5563', fontSize: '14.5px', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
                    <li><b>Đặt lịch trước:</b> Việc sử dụng các thiết bị phân tích, lò nung, hoặc máy đo thực nghiệm phải được đăng ký trước thông qua hệ thống và được sự phê duyệt của cán bộ quản lý.</li>
                    <li><b>Tuân thủ an toàn:</b> Người dùng phải tuân thủ tuyệt đối nội quy an toàn lao động, an toàn hóa chất và phòng chống cháy nổ tại Phòng thí nghiệm 211 - C5. Bất kỳ sự cố nào xảy ra do cố ý làm sai quy trình đều phải bồi thường theo quy định của nhà trường.</li>
                </ul>
            </div>

            <div style={sectionStyle}>
                <h3 style={titleStyle}><span>3️⃣</span> Sở hữu trí tuệ & Dữ liệu Nghiên cứu</h3>
                <ul style={{ color: '#4b5563', fontSize: '14.5px', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
                    <li>Mọi dữ liệu thực nghiệm, kết quả đo đạc và tài liệu học thuật được lưu trữ hoặc chia sẻ thông qua nền tảng này đều thuộc quyền sở hữu chung của Ban quản lý Lab 211.</li>
                    <li>Nghiêm cấm việc sao chép, phát tán trái phép các số liệu nghiên cứu, đồ án, luận văn chưa công bố ra bên ngoài khi chưa có sự đồng ý bằng văn bản của cán bộ hướng dẫn.</li>
                </ul>
            </div>

            <div style={sectionStyle}>
                <h3 style={titleStyle}><span>4️⃣</span> Giới hạn Trách nhiệm</h3>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '14.5px', lineHeight: '1.8' }}>
                    Ban quản trị hệ thống có quyền tạm khóa hoặc thu hồi vĩnh viễn quyền truy cập của bất kỳ tài khoản nào vi phạm các điều khoản trên mà không cần thông báo trước. Nền tảng được cung cấp "như nguyên trạng", chúng tôi không chịu trách nhiệm về các gián đoạn kỹ thuật do lỗi đường truyền hoặc sự cố máy chủ khách quan.
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