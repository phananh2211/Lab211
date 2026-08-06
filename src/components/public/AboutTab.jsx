export default function AboutTab({ onBack }) {
    const containerStyle = { padding: '30px', fontFamily: 'system-ui, sans-serif', maxHeight: '75vh', overflowY: 'auto' };
    const headingStyle = { color: '#1f2937', marginBottom: '20px', fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px' };
    const subHeadingStyle = { color: '#1e40af', margin: '25px 0 12px 0', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' };
    const textStyle = { color: '#4b5563', lineHeight: '1.8', marginBottom: '16px', fontSize: '15px', textAlign: 'justify' };
    const cardStyle = { backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '15px', transition: 'transform 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' };
    const buttonStyle = { padding: '12px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', marginTop: '25px', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' };

    return (
        <div style={containerStyle}>
            <h2 style={headingStyle}>🏛️ Về Chúng Tôi — Lab 211</h2>
            
            <p style={textStyle}>
                Tọa lạc tại <b>Phòng 211, Tầng 2, Tòa nhà C5</b>, thuộc Trường Vật liệu (SMSE) – Đại học Bách khoa Hà Nội, <b>Phòng thí nghiệm 211</b> là một môi trường học thuật chuyên sâu và năng động. Dưới sự dẫn dắt chuyên môn tận tâm của <b>PGS. TS. Trần Vũ Diễm Ngọc</b> và <b>TS. Nguyễn Thị Thảo</b>, Lab 211 đã và đang trở thành cái nôi nuôi dưỡng niềm đam mê khoa học, nơi các thế hệ sinh viên và học viên cao học biến những ý tưởng nghiên cứu lý thuyết thành các ứng dụng kỹ thuật thực tiễn.
            </p>

            <h3 style={subHeadingStyle}><span>🎯</span> Sứ mệnh & Tầm nhìn</h3>
            <p style={textStyle}>
                Chúng tôi hướng tới việc xây dựng một hệ sinh thái nghiên cứu toàn diện, kết hợp chặt chẽ giữa khoa học vật liệu cấu trúc và công nghệ chế tạo tiên tiến. Sứ mệnh cốt lõi của Lab 211 là đào tạo ra những kỹ sư, thạc sĩ có tư duy phản biện sắc bén, làm chủ được cả quy trình tổng hợp vật liệu truyền thống lẫn các công cụ đánh giá, tự động hóa đo lường hiện đại nhất.
            </p>

            <h3 style={subHeadingStyle}><span>🔬</span> Các Hướng Nghiên Cứu Mũi Nhọn</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px', marginTop: '15px' }}>
                
                <div style={cardStyle}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#111827', fontSize: '16px', fontWeight: '700' }}>⚡ Gốm Áp Điện & Vật Liệu Điện Tử</h4>
                    <p style={{ margin: 0, color: '#4b5563', fontSize: '14px', lineHeight: '1.6' }}>
                        Nghiên cứu, chế tạo và đánh giá tính chất cơ - lý của hệ vật liệu gốm áp điện (điển hình như BNT-BT, PZT). Tập trung vào phân tích độ mỏi vật liệu và sự biến đổi cấu trúc dưới tác động của điện trường.
                    </p>
                </div>

                <div style={cardStyle}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#111827', fontSize: '16px', fontWeight: '700' }}>🔥 Công Nghệ Thiêu Kết Tiên Tiến</h4>
                    <p style={{ margin: 0, color: '#4b5563', fontSize: '14px', lineHeight: '1.6' }}>
                        Ứng dụng kỹ thuật thiêu kết tia lửa plasma (Spark Plasma Sintering - SPS) kết hợp tinh chỉnh vi cấu trúc nhằm tối ưu hóa cơ tính cho các vật liệu cấu trúc nano, titan xốp và kim loại màu.
                    </p>
                </div>

                <div style={cardStyle}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#111827', fontSize: '16px', fontWeight: '700' }}>📊 Phân Tích Cấu Trúc Chuyên Sâu</h4>
                    <p style={{ margin: 0, color: '#4b5563', fontSize: '14px', lineHeight: '1.6' }}>
                        Sử dụng các công cụ tính toán và phần mềm chuyên dụng để thực hiện tinh chỉnh cấu trúc tinh thể (Rietveld refinement), làm rõ mối quan hệ mật thiết giữa mạng tinh thể và tính chất vĩ mô.
                    </p>
                </div>

                <div style={cardStyle}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#111827', fontSize: '16px', fontWeight: '700' }}>💻 Chuyển Đổi Số & Tự Động Hóa Lab</h4>
                    <p style={{ margin: 0, color: '#4b5563', fontSize: '14px', lineHeight: '1.6' }}>
                        Tiên phong trong việc lập trình các hệ thống thu thập dữ liệu thời gian thực và tự động hóa quy trình kiểm tra thực nghiệm (kết hợp các giao diện phần mềm hiện đại), giúp nâng cao độ chính xác của số liệu nghiên cứu.
                    </p>
                </div>
            </div>

            <h3 style={subHeadingStyle}><span>🤝</span> Môi Trường Văn Hóa Lab</h3>
            <p style={textStyle}>
                Tại Lab 211, sự kỷ luật trong nghiên cứu đi song hành với tinh thần đoàn kết. Những giờ phút căng thẳng bên thiết bị phân tích hay lò nung luôn được xoa dịu bởi sự hướng dẫn ân cần của các cô và sự sẻ chia kinh nghiệm giữa các thế hệ thành viên. Dù là một thông số thực nghiệm chưa ưng ý hay một đoạn code vận hành máy bị lỗi, tinh thần <i>"cùng học hỏi - cùng tiến bộ"</i> luôn là kim chỉ nam giúp tập thể Lab 211 gặt hái nhiều kết quả xuất sắc.
            </p>

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