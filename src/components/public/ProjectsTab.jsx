export default function ProjectsTab({ onBack }) {
    const containerStyle = { padding: '30px', fontFamily: 'system-ui, sans-serif', maxHeight: '75vh', overflowY: 'auto' };
    const headingStyle = { color: '#1f2937', marginBottom: '20px', fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px' };
    const textStyle = { color: '#4b5563', lineHeight: '1.8', marginBottom: '25px', fontSize: '15px', textAlign: 'justify' };
    const cardStyle = { backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', transition: 'transform 0.2s', position: 'relative', overflow: 'hidden' };
    const titleStyle = { margin: '0 0 12px 0', color: '#111827', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' };
    const tagStyle = { display: 'inline-block', backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginRight: '8px', marginBottom: '10px' };
    const buttonStyle = { padding: '12px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' };
    const highlightBarStyle = { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#2563eb' };

    return (
        <div style={containerStyle}>
            <h2 style={headingStyle}>🤝 Hợp Tác & Dự Án Triển Khai</h2>
            <p style={textStyle}>
                Lab 211 luôn chú trọng kết nối những nghiên cứu khoa học hàn lâm với việc giải quyết các bài toán kỹ thuật thực tiễn. Chúng tôi tự hào triển khai các dự án đa dạng từ phát triển vật liệu tiên tiến, tự động hóa đo lường cho đến công nghệ luyện kim màu và tuần hoàn tài nguyên.
            </p>

            {/* Dự án 1: Luyện kim màu & Tái chế chất thải (Mới thêm theo chuyên môn cô Thảo) */}
            <div style={cardStyle} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{...highlightBarStyle, backgroundColor: '#0ea5e9'}}></div>
                <h3 style={titleStyle}><span>♻️</span> Thu Hồi Kim Loại & Xử Lý Chất Thải Công Nghiệp</h3>
                <div>
                    <span style={tagStyle}>Luyện Kim Màu</span>
                    <span style={tagStyle}>Pin Lithium Thải</span>
                    <span style={tagStyle}>Xử Lý Bùn Đỏ</span>
                </div>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '14.5px', lineHeight: '1.7', textAlign: 'justify' }}>
                    Nghiên cứu và tối ưu hóa các quy trình công nghệ hòa tách, thu hồi kim loại quý và kim loại màu từ các nguồn phế thải công nghiệp và rác thải điện tử. Tiêu biểu là các hướng tiếp cận xử lý bùn đỏ bauxite hoặc thu hồi các nguyên tố có giá trị từ phế liệu pin lithium thải, góp phần thúc đẩy mô hình kinh tế tuần hoàn và phát triển vật liệu bền vững.
                </p>
            </div>

            {/* Dự án 2 */}
            <div style={cardStyle} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={highlightBarStyle}></div>
                <h3 style={titleStyle}><span>🖥️</span> Hệ Thống Tự Động Hóa Đo Lường Mỏi Gốm Áp Điện</h3>
                <div>
                    <span style={tagStyle}>Python Pipeline</span>
                    <span style={tagStyle}>PyQt6</span>
                    <span style={tagStyle}>Real-time Sensor</span>
                </div>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '14.5px', lineHeight: '1.7', textAlign: 'justify' }}>
                    Dự án thiết kế và xây dựng kiến trúc phần mềm dạng module hóa nhằm tự động hóa quá trình thu thập dữ liệu từ các thiết bị kiểm tra đo mỏi vật liệu gốm áp điện. Sử dụng ngôn ngữ Python kết hợp nền tảng giao diện PyQt6, hệ thống giúp kết nối trực tiếp với phần cứng cảm biến, xử lý dữ liệu theo thời gian thực và xuất báo cáo tự động, nâng cao đáng kể độ tin cậy của quy trình thực nghiệm tại Lab.
                </p>
            </div>

            {/* Dự án 3 */}
            <div style={cardStyle} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{...highlightBarStyle, backgroundColor: '#10b981'}}></div>
                <h3 style={titleStyle}><span>🔥</span> Tối Ưu Hóa Vi Cấu Trúc Vật Liệu Bằng Công Nghệ SPS</h3>
                <div>
                    <span style={tagStyle}>SPS Sintering</span>
                    <span style={tagStyle}>Titan Xốp</span>
                    <span style={tagStyle}>Đề Tài Cấp Trường</span>
                </div>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '14.5px', lineHeight: '1.7', textAlign: 'justify' }}>
                    Nghiên cứu ứng dụng công nghệ thiêu kết tia lửa plasma (Spark Plasma Sintering) để chế tạo hợp kim màu và vật liệu Titan xốp có độ xốp kiểm soát. Dự án giải quyết các vấn đề về tối ưu hóa chế độ nhiệt độ - áp suất, từ đó cải thiện độ bền cơ học và đặc tính y sinh của vật liệu.
                </p>
            </div>

            {/* Dự án 4 */}
            <div style={cardStyle} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{...highlightBarStyle, backgroundColor: '#f59e0b'}}></div>
                <h3 style={titleStyle}><span>📊</span> Đánh Giá Đặc Trưng Cấu Trúc Hệ Gốm Áp Điện</h3>
                <div>
                    <span style={tagStyle}>Rietveld Refinement</span>
                    <span style={tagStyle}>BNT-BT / PZT</span>
                    <span style={tagStyle}>Crystallography</span>
                </div>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '14.5px', lineHeight: '1.7', textAlign: 'justify' }}>
                    Tập trung triển khai các hướng đề tài phân tích chuyên sâu sự biến đổi pha và tinh chỉnh thông số mạng tinh thể (Rietveld refinement) trên các hệ gốm áp điện điển hình như BNT-BT và PZT. Kết quả của các dự án này cung cấp cơ sở dữ liệu quan trọng để giải thích các cơ chế vi mô định hình nên tính chất cơ lý của vật liệu.
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