export default function PublicContent({ currentView, onBack }) {
    const containerStyle = { padding: '30px', fontFamily: 'system-ui, sans-serif', maxHeight: '75vh', overflowY: 'auto' };
    const headingStyle = { color: '#1f2937', marginBottom: '20px', fontSize: '24px', fontWeight: '800' };
    const subHeadingStyle = { color: '#374151', marginTop: '25px', marginBottom: '12px', fontSize: '18px', fontWeight: '700' };
    const textStyle = { color: '#4b5563', lineHeight: '1.8', marginBottom: '20px', fontSize: '15px' };
    const buttonStyle = { padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px' };

    // 1. Tab Giới thiệu (About)
    if (currentView === 'about') {
        return (
            <div style={containerStyle}>
                <h2 style={headingStyle}>🏛️ Giới thiệu Lab 211</h2>
                <p style={textStyle}>
                    Phòng thí nghiệm 211 thuộc Bộ môn Khoa học và Kỹ thuật Vật liệu, Trường Vật liệu — Đại học Bách khoa Hà Nội. Dưới sự định hướng chuyên môn và dẫn dắt trực tiếp của các chuyên gia hàng đầu như <b>PGS. TS. Trần Vũ Điểm Ngọc</b> và <b>TS. Nguyễn Thị Thảo</b>[cite: 7], Lab 211 là tập thể quy tụ các giảng viên, nghiên cứu viên, học viên cao học và sinh viên tài năng[cite: 7].
                </p>
                <h3 style={subHeadingStyle}>🎯 Sứ mệnh & Định hướng nghiên cứu</h3>
                <p style={textStyle}>
                    Phòng thí nghiệm tập trung nghiên cứu chuyên sâu về các loại vật liệu tiên tiến, vật liệu cấu trúc nano, luyện kim hiện đại và công nghệ chế tạo vật liệu gốm kỹ thuật cao[cite: 7]. Sứ mệnh cốt lõi của chúng tôi là gắn kết chặt chẽ giữa lý thuyết nghiên cứu khoa học hàn lâm và các ứng dụng thực tiễn trong công nghiệp[cite: 7].
                </p>
                <h3 style={subHeadingStyle}>🧪 Cơ sở vật chất & Môi trường học thuật</h3>
                <p style={textStyle}>
                    Đặt trụ sở tại Tòa nhà C5 (Đại học Bách khoa Hà Nội), Lab 211 được trang bị hệ thống thiết bị thực nghiệm và phân tích đồng bộ phục vụ công tác nghiên cứu khoa học và đào tạo kỹ sư trẻ.
                </p>
                <button onClick={onBack} style={buttonStyle}>← Quay lại trang chính</button>
            </div>
        );
    }

    // 2. Tab Giảng viên (Faculty)
    if (currentView === 'faculty') {
        return (
            <div style={containerStyle}>
                <h2 style={headingStyle}>👨‍🏫 Giảng viên & Cán bộ Hướng dẫn</h2>
                <p style={textStyle}>
                    Đối với chúng em — những thế hệ sinh viên và học viên gắn bó với mái nhà chung Lab 211, hai cô không chỉ là những nhà khoa học tận tụy trên bục giảng mà còn là những người thầy, người cô lớn luôn kiên nhẫn dìu dắt chúng em[cite: 1].
                </p>
                <div style={{ textAlign: 'center', margin: '25px 0', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <img 
                        src={`${import.meta.env.BASE_URL}8e58150a-aca1-4314-9352-f3ed1060f476.jpg`} 
                        alt="PGS. TS. Trần Vũ Điểm Ngọc và TS. Nguyễn Thị Thảo" 
                        style={{ width: '100%', maxWidth: '650px', height: 'auto', objectFit: 'cover', borderRadius: '10px' }} 
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '22px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ margin: '0 0 6px 0', color: '#111827', fontSize: '18px' }}>🌸 PGS. TS. Trần Vũ Điểm Ngọc</h3>
                        <p style={{ margin: '0 0 12px 0', color: '#2563eb', fontSize: '13px', fontWeight: '700' }}>Giảng viên chính / Chuyên gia định hướng nghiên cứu vật liệu</p>
                        <p style={{ margin: '0 0 12px 0', color: '#4b5563', fontSize: '14px', lineHeight: '1.7' }}>
                            Sắc sảo trong tư duy khoa học nhưng vô cùng gần gũi, luôn khơi gợi cảm hứng sáng tạo và rèn luyện sự nghiêm khắc chuẩn mực cho sinh viên trong phòng thí nghiệm[cite: 1].
                        </p>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', padding: '22px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ margin: '0 0 6px 0', color: '#111827', fontSize: '18px' }}>🌻 TS. Nguyễn Thị Thảo</h3>
                        <p style={{ margin: '0 0 12px 0', color: '#2563eb', fontSize: '13px', fontWeight: '700' }}>Cán bộ nghiên cứu & Giảng viên đồng hành chuyên môn</p>
                        <p style={{ margin: '0 0 12px 0', color: '#4b5563', fontSize: '14px', lineHeight: '1.7' }}>
                            Tỉ mỉ, kiên nhẫn hướng dẫn chi tiết từng mẻ mẫu gốm, quy trình thiêu kết và cách xử lý số liệu, tiếp thêm động lực lớn cho học viên[cite: 1].
                        </p>
                    </div>
                </div>
                <button onClick={onBack} style={buttonStyle}>← Quay lại trang chính</button>
            </div>
        );
    }

    // 3. Tab Lĩnh vực nghiên cứu (Research)
    if (currentView === 'research') {
        return (
            <div style={containerStyle}>
                <h2 style={headingStyle}>🔬 Lĩnh vực nghiên cứu cốt lõi</h2>
                <p style={textStyle}>
                    Định hướng nghiên cứu tại Lab 211 được xây dựng dựa trên sự giao thoa giữa khoa học vật liệu cấu trúc và công nghệ chế tạo tiên tiến dưới sự chủ trì của PGS. TS. Trần Vũ Điểm Ngọc và TS. Nguyễn Thị Thảo[cite: 5].
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <h4 style={{ margin: '0 0 6px 0', color: '#111827', fontSize: '16px' }}>⚙️ Công nghệ thiêu kết Plasma (SPS) & Vật liệu Titan xốp</h4>
                        <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>Ứng dụng thiêu kết plasma dòng điện xung để chế tạo và tối ưu hóa cơ tính vật liệu Titan xốp cho y sinh[cite: 5].</p>
                    </div>
                    <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <h4 style={{ margin: '0 0 6px 0', color: '#111827', fontSize: '16px' }}>⚡ Gốm kỹ thuật cao & Hệ thống gốm áp điện</h4>
                        <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>Nghiên cứu đặc trưng cấu trúc và độ mỏi của hệ gốm áp điện (BNT-BT, PZT)[cite: 5].</p>
                    </div>
                    <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <h4 style={{ margin: '0 0 6px 0', color: '#111827', fontSize: '16px' }}>🧪 Hóa học luyện kim & Thu hồi khoáng sản</h4>
                        <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>Tối ưu hóa quy trình thu hồi kim loại quý Gallium từ bùn đỏ[cite: 5].</p>
                    </div>
                </div>
                <button onClick={onBack} style={buttonStyle}>← Quay lại trang chính</button>
            </div>
        );
    }

    // 4. Tab Dự án & Hợp tác (Projects)
    if (currentView === 'projects_info') {
        return (
            <div style={containerStyle}>
                <h2 style={headingStyle}>🤝 Hợp tác nghiên cứu & Dự án</h2>
                <p style={textStyle}>
                    Lab 211 tích cực duy trì các mối quan hệ hợp tác chiến lược với các viện nghiên cứu lớn và doanh nghiệp công nghiệp dưới sự kết nối của các thầy cô[cite: 3].
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', margin: '20px 0' }}>
                    <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '16px' }}>🔬 Đề tài Nghiên cứu Khoa học</h4>
                        <p style={{ margin: 0, color: '#4b5563', fontSize: '13.5px' }}>Chủ trì các đề tài cấp bộ, cấp trường về vật liệu cấu trúc tiên tiến và luyện kim sạch[cite: 3].</p>
                    </div>
                    <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '16px' }}>🏭 Chuyển giao công nghệ</h4>
                        <p style={{ margin: 0, color: '#4b5563', fontSize: '13.5px' }}>Giải quyết bài toán thực tiễn về kiểm tra độ mỏi vật liệu và cải tiến chất lượng gốm - kim loại[cite: 3].</p>
                    </div>
                </div>
                <button onClick={onBack} style={buttonStyle}>← Quay lại trang chính</button>
            </div>
        );
    }

    // 5. Tab Bài báo khoa học (Public Documents)
    if (currentView === 'public_documents') {
        return (
            <div style={containerStyle}>
                <h2 style={headingStyle}>📚 Bài Báo & Công Bố Khoa Học</h2>
                <p style={textStyle}>
                    Các công trình nghiên cứu của tập thể Lab 211 luôn đạt giá trị học thuật cao, công bố trên các tạp chí quốc tế uy tín[cite: 4].
                </p>
                <h3 style={subHeadingStyle}>🌟 Các hướng công bố tiêu biểu</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                    <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <h4 style={{ margin: '0 0 6px 0', color: '#111827', fontSize: '16px' }}>📑 Tạp chí Quốc tế (SCI / SCIE)[cite: 4]</h4>
                        <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>Nghiên cứu về Titan xốp, gốm áp điện và thiêu kết plasma SPS xuất bản trên các danh mục ISI/Scopus hàng đầu[cite: 4].</p>
                    </div>
                    <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <h4 style={{ margin: '0 0 6px 0', color: '#111827', fontSize: '16px' }}>🎤 Hội nghị & Hội thảo Khoa học[cite: 4]</h4>
                        <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>Các báo cáo trình bày tại hội nghị vật liệu toàn quốc và quốc tế[cite: 4].</p>
                    </div>
                </div>
                <button onClick={onBack} style={buttonStyle}>← Quay lại trang chính</button>
            </div>
        );
    }

    // 6. Tab Điều khoản sử dụng (Terms)
    if (currentView === 'terms') {
        return (
            <div style={containerStyle}>
                <h2 style={headingStyle}>📜 Điều Khoản Sử Dụng Hệ Thống Quản Lý Lab 211</h2>
                <p style={textStyle}>
                    Chào mừng bạn đến với Hệ thống Quản lý Phòng thí nghiệm Lab 211 thuộc Trường Vật liệu — Đại học Bách khoa Hà Nội[cite: 6].
                </p>
                <h3 style={subHeadingStyle}>1. Quy định về tài khoản định danh</h3>
                <p style={textStyle}>
                    Bắt buộc đăng ký và xác thực bằng email chính thức của trường (<span style={{ color: '#1d4ed8', fontWeight: '600' }}>@hust.edu.vn</span> hoặc <span style={{ color: '#1d4ed8', fontWeight: '600' }}>@sis.hust.edu.vn</span>)[cite: 6].
                </p>
                <h3 style={subHeadingStyle}>2. Quy tắc vận hành thiết bị</h3>
                <p style={textStyle}>
                    Tuân thủ nghiêm ngặt lịch đặt thiết bị, an toàn lao động, an toàn điện và hóa chất tại Tòa nhà C5[cite: 6].
                </p>
                <button onClick={onBack} style={buttonStyle}>← Quay lại trang chính</button>
            </div>
        );
    }

    // 7. Tab Chính sách bảo mật (Privacy)
    if (currentView === 'privacy') {
        return (
            <div style={containerStyle}>
                <h2 style={headingStyle}>🔒 Chính Sách Bảo Mật Thông Tin & Dữ Liệu</h2>
                <p style={textStyle}>
                    Phòng thí nghiệm Lab 211 cam kết bảo vệ tối đa quyền riêng tư và an toàn dữ liệu nghiên cứu của cán bộ, học viên[cite: 2].
                </p>
                <h3 style={subHeadingStyle}>1. Thu thập dữ liệu tối thiểu</h3>
                <p style={textStyle}>
                    Thu thập họ tên, MSSV, email trường và lịch sử hoạt động liên quan đến quản lý thiết bị và đề tài[cite: 2].
                </p>
                <h3 style={subHeadingStyle}>2. Bảo mật tuyệt đối</h3>
                <p style={textStyle}>
                    Không chia sẻ thông tin cho bên thứ ba ngoài ban quản lý khoa học, ứng dụng mã hóa cơ sở dữ liệu Supabase và HTTPS chuẩn SSL[cite: 2].
                </p>
                <button onClick={onBack} style={buttonStyle}>← Quay lại trang chính</button>
            </div>
        );
    }

    return null;
}