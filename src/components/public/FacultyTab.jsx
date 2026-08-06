export default function FacultyTab({ onBack }) {
    const containerStyle = { padding: '30px', fontFamily: 'system-ui, sans-serif', maxHeight: '75vh', overflowY: 'auto' };
    const headingStyle = { color: '#1f2937', marginBottom: '20px', fontSize: '24px', fontWeight: '800' };
    const textStyle = { color: '#4b5563', lineHeight: '1.8', marginBottom: '20px', fontSize: '15px' };
    const buttonStyle = { padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px' };

    return (
        <div style={containerStyle}>
            <h2 style={headingStyle}>👨‍🏫 Giảng viên & Cán bộ Hướng dẫn</h2>
            <p style={textStyle}>
                Đối với những thế hệ học viên cao học và sinh viên gắn bó với mái nhà chung Lab 211, các cô không chỉ là những nhà khoa học tận tụy trên bục giảng mà còn là những người thầy lớn. Nhờ sự kiên nhẫn dìu dắt của các cô, những dự án luận văn Thạc sĩ hay các bước chập chững làm quen với nghiên cứu khoa học thực chiến tại Tòa nhà C5 đều trở nên vững vàng hơn.
            </p>

            {/* Khung ảnh kỷ niệm chung vô cùng thẩm mỹ */}
            <div style={{ textAlign: 'center', margin: '25px 0', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ overflow: 'hidden', borderRadius: '12px', maxHeight: '380px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img 
                        src={`${import.meta.env.BASE_URL}8e58150a-aca1-4314-9352-f3ed1060f476.jpg`} 
                        alt="PGS. TS. Trần Vũ Diễm Ngọc và TS. Nguyễn Thị Thảo" 
                        style={{ width: '100%', maxWidth: '650px', height: 'auto', objectFit: 'cover', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} 
                    />
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', marginTop: '10px', marginBottom: '0' }}>
                    Khoảnh khắc đồng hành cùng các thầy cô trong những chuyến đi thực tế và nghiên cứu.
                </p>
            </div>
            
            {/* Danh sách chi tiết từng cô dưới góc nhìn sinh viên */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                
                {/* Cô 1: PGS. TS. Trần Vũ Diễm Ngọc */}
                <div style={{ backgroundColor: '#ffffff', padding: '22px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ margin: '0 0 6px 0', color: '#111827', fontSize: '18px' }}>
                        🌸 PGS. TS. Trần Vũ Diễm Ngọc
                    </h3>
                    <p style={{ margin: '0 0 12px 0', color: '#2563eb', fontSize: '13px', fontWeight: '700' }}>
                        Giảng viên cao cấp / Phó trưởng Khoa Kỹ Thuật Vật Liệu
                    </p>
                    <p style={{ margin: '0 0 12px 0', color: '#4b5563', fontSize: '14px', lineHeight: '1.7' }}>
                        <b>Lĩnh vực chuyên môn:</b> Luyện và tái chế kim loại màu; Chế tạo vật liệu gốm áp điện (cơ sở chì và không chì); Tổng hợp vật liệu nano và bột sắc tố TiO2.
                        <br/><br/>
                        <b>Góc nhìn học viên:</b> Với chuyên môn sâu rộng, cô Diễm Ngọc là người trực tiếp định hướng cho các đề tài mũi nhọn của lab, đặc biệt là các dự án đánh giá tính chất và độ mỏi của hệ gốm áp điện BNT-BT hay PZT. Sự sắc bén trong tư duy khoa học và những tiêu chuẩn khắt khe cô đặt ra khi phân tích cấu trúc vật liệu chính là ngọn hải đăng giúp chúng em vượt qua những bế tắc trong luận văn. Dù nghiêm khắc trong công việc, cô vẫn luôn là một người hướng dẫn gần gũi, khơi gợi tư duy phản biện cho từng thành viên.
                    </p>
                    <div style={{ fontSize: '12.5px', color: '#0369a1', backgroundColor: '#e0f2fe', padding: '8px 12px', borderRadius: '8px', display: 'inline-block' }}>
                        🌐 <a href="https://smse.hust.edu.vn/vi/organs/person/Khoa-Ky-Thuat-Vat-Lieu-12/PGS-TS-Tran-Vu-Diem-Ngoc-21/" target="_blank" rel="noopener noreferrer" style={{ color: '#0369a1', fontWeight: '600', textDecoration: 'none' }}>Xem hồ sơ khoa học tại SMSE HUST</a>
                    </div>
                </div>

                {/* Cô 2: TS. Nguyễn Thị Thảo */}
                <div style={{ backgroundColor: '#ffffff', padding: '22px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ margin: '0 0 6px 0', color: '#111827', fontSize: '18px' }}>
                        🌻 TS. Nguyễn Thị Thảo
                    </h3>
                    <p style={{ margin: '0 0 12px 0', color: '#2563eb', fontSize: '13px', fontWeight: '700' }}>
                        Giảng viên / Nhóm chuyên môn: Vật liệu Kim loại màu và Compozit
                    </p>
                    <p style={{ margin: '0 0 12px 0', color: '#4b5563', fontSize: '14px', lineHeight: '1.7' }}>
                        <b>Lĩnh vực chuyên môn:</b> Luyện kim màu, công nghệ thu hồi và tái chế kim loại quý/kim loại màu từ phế thải công nghiệp (như xử lý bùn đỏ, hòa tách kim loại từ pin lithium thải) và nghiên cứu phát triển vật liệu compozit.
                        <br/><br/>
                        <b>Góc nhìn học viên:</b> Nhắc đến cô Thảo là nhắc đến sự tận tâm và tỉ mỉ đến tuyệt vời trong phòng thí nghiệm. Khi chúng em đối mặt với những thách thức trong thực nghiệm — từ việc tối ưu hóa quy trình hòa tách dung dịch, xử lý các mẻ mẫu phức tạp cho đến việc gỡ rối từng lỗi kỹ thuật nhỏ trong quá trình phân tích — cô luôn trực tiếp đồng hành và kiên nhẫn chỉ dẫn. Nguồn năng lượng tích cực và sự ân cần của cô đã tiếp thêm rất nhiều động lực để chúng em kiên trì theo đuổi các hướng nghiên cứu tuần hoàn tài nguyên và vật liệu bền vững.
                    </p>
                    <div style={{ fontSize: '12.5px', color: '#0369a1', backgroundColor: '#e0f2fe', padding: '8px 12px', borderRadius: '8px', display: 'inline-block' }}>
                        🌐 <a href="https://smse.hust.edu.vn/vi/organs/person/Khoa-Ky-Thuat-Vat-Lieu-12/TS-Nguyen-Thi-Thao-20/" target="_blank" rel="noopener noreferrer" style={{ color: '#0369a1', fontWeight: '600', textDecoration: 'none' }}>Xem hồ sơ khoa học tại SMSE HUST</a>
                    </div>
                </div>

            </div>

            <button onClick={onBack} style={buttonStyle}>← Quay lại trang chính</button>
        </div>
    );
}