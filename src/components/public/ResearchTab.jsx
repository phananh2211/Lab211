export default function ResearchTab({ onBack }) {
    const containerStyle = { padding: '30px', fontFamily: 'system-ui, sans-serif', maxHeight: '75vh', overflowY: 'auto' };
    const headingStyle = { color: '#1f2937', marginBottom: '20px', fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px' };
    const textStyle = { color: '#4b5563', lineHeight: '1.8', marginBottom: '25px', fontSize: '15px', textAlign: 'justify' };
    const cardStyle = { backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', transition: 'transform 0.2s' };
    const titleStyle = { margin: '0 0 12px 0', color: '#111827', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' };
    const tagStyle = { display: 'inline-block', backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginRight: '8px', marginBottom: '10px' };
    const buttonStyle = { padding: '12px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' };

    return (
        <div style={containerStyle}>
            <h2 style={headingStyle}>🔬 Lĩnh Vực Nghiên Cứu Cốt Lõi</h2>
            <p style={textStyle}>
                Tại Lab 211, các hoạt động nghiên cứu được triển khai đồng bộ từ khâu tổng hợp, chế tạo vật liệu, phân tích cấu trúc tinh thể cho đến việc phát triển các hệ thống đo lường tự động hóa. Chúng tôi tự hào mang đến những giải pháp toàn diện trong lĩnh vực Khoa học và Kỹ thuật Vật liệu.
            </p>

            {/* Hướng 1 */}
            <div style={cardStyle} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <h3 style={titleStyle}><span>⚡</span> Vật Liệu Gốm Áp Điện & Chức Năng</h3>
                <div>
                    <span style={tagStyle}>BNT-BT</span>
                    <span style={tagStyle}>PZT</span>
                    <span style={tagStyle}>Piezoelectric Fatigue</span>
                </div>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '14.5px', lineHeight: '1.7', textAlign: 'justify' }}>
                    Tập trung tổng hợp và khảo sát các hệ vật liệu gốm áp điện không chì (hệ BNT-BT) và có chì (PZT). Nghiên cứu chuyên sâu đánh giá độ mỏi của gốm áp điện dưới tác dụng của điện trường chu kỳ, từ đó dự đoán tuổi thọ và độ tin cậy của vật liệu trong các ứng dụng cảm biến và cơ cấu chấp hành thực tế.
                </p>
            </div>

            {/* Hướng 2 */}
            <div style={cardStyle} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <h3 style={titleStyle}><span>🔥</span> Công Nghệ Thiêu Kết & Luyện Kim</h3>
                <div>
                    <span style={tagStyle}>Spark Plasma Sintering (SPS)</span>
                    <span style={tagStyle}>Titan Xốp</span>
                </div>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '14.5px', lineHeight: '1.7', textAlign: 'justify' }}>
                    Ứng dụng kỹ thuật thiêu kết tia lửa plasma (SPS) tiên tiến để chế tạo các loại vật liệu có cấu trúc đặc biệt mà phương pháp truyền thống khó đạt được. Hướng nghiên cứu tối ưu hóa thông số nhiệt độ, áp suất nhằm kiểm soát vi cấu trúc, mật độ và cơ tính cho kim loại xốp (như Titan xốp y sinh) và các hợp kim màu.
                </p>
            </div>

            {/* Hướng 3 */}
            <div style={cardStyle} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <h3 style={titleStyle}><span>📊</span> Phân Tích & Tinh Chỉnh Cấu Trúc</h3>
                <div>
                    <span style={tagStyle}>Rietveld Refinement</span>
                    <span style={tagStyle}>Crystallography</span>
                    <span style={tagStyle}>XRD</span>
                </div>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '14.5px', lineHeight: '1.7', textAlign: 'justify' }}>
                    Sử dụng dữ liệu nhiễu xạ tia X (XRD) kết hợp với phương pháp tinh chỉnh cấu trúc tinh thể (Rietveld refinement) để xác định chính xác các thông số mạng, vị trí nguyên tử và định lượng pha. Kỹ thuật này đóng vai trò then chốt để giải thích bản chất vật lý và nguồn gốc tính chất ưu việt của hệ vật liệu mới.
                </p>
            </div>

            {/* Hướng 4 */}
            <div style={cardStyle} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <h3 style={titleStyle}><span>💻</span> Tự Động Hóa & Thiết Kế Phần Mềm</h3>
                <div>
                    <span style={tagStyle}>Python Pipeline</span>
                    <span style={tagStyle}>PyQt6</span>
                    <span style={tagStyle}>Real-time Sensor</span>
                </div>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '14.5px', lineHeight: '1.7', textAlign: 'justify' }}>
                    Tiên phong xây dựng kiến trúc phần mềm (sử dụng Python và framework giao diện PyQt6) để thiết lập các đường ống (pipeline) xử lý dữ liệu thời gian thực. Tự động hóa quá trình thu thập thông số từ phần cứng cảm biến trên các thiết bị kiểm tra đo mỏi gốm áp điện, giúp nâng cao độ chính xác và tính module hóa trong thực nghiệm.
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