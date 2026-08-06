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
                Tại Lab 211, các hoạt động nghiên cứu được triển khai đồng bộ dưới sự định hướng chuyên môn của PGS. TS. Trần Vũ Diễm Ngọc và TS. Nguyễn Thị Thảo. Chúng tôi tập trung từ khâu tổng hợp vật liệu điện tử tiên tiến, luyện kim màu, tuần hoàn tài nguyên cho đến phát triển các hệ thống đo lường tự động hóa.
            </p>

            {/* Hướng 1: Gốm áp điện & Vật liệu điện tử (Định hướng PGS. Ngọc) */}
            <div style={cardStyle} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <h3 style={titleStyle}><span>⚡</span> Vật Liệu Gốm Áp Điện & Chức Năng</h3>
                <div>
                    <span style={tagStyle}>BNT-BT</span>
                    <span style={tagStyle}>PZT</span>
                    <span style={tagStyle}>Piezoelectric Fatigue</span>
                </div>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '14.5px', lineHeight: '1.7', textAlign: 'justify' }}>
                    Tập trung tổng hợp và khảo sát các hệ vật liệu gốm áp điện không chì (hệ BNT-BT) và có chì (PZT). Nghiên cứu chuyên sâu đánh giá độ mỏi của gốm áp điện dưới tác dụng của điện trường chu kỳ, từ đó dự đoán tuổi thọ và độ tin cậy trong các ứng dụng cảm biến thực tế.
                </p>
            </div>

            {/* Hướng 2: Luyện kim màu & Tái chế chất thải (Định hướng TS. Thảo) */}
            <div style={cardStyle} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <h3 style={titleStyle}><span>♻️</span> Luyện Kim Màu & Xử Lý Chất Thải Công Nghiệp</h3>
                <div>
                    <span style={tagStyle}>Luyện Kim Màu</span>
                    <span style={tagStyle}>Pin Lithium Thải</span>
                    <span style={tagStyle}>Xử Lý Bùn Đỏ</span>
                </div>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '14.5px', lineHeight: '1.7', textAlign: 'justify' }}>
                    Nghiên cứu công nghệ hòa tách và thu hồi kim loại màu, kim loại quý từ các nguồn phế thải công nghiệp và rác thải điện tử (như xử lý bùn đỏ bauxite hoặc tái chế phế liệu pin lithium). Hướng đi này thúc đẩy mạnh mẽ mô hình kinh tế tuần hoàn và phát triển vật liệu bền vững.
                </p>
            </div>

            {/* Hướng 3: Phân tích tinh chỉnh cấu trúc */}
            <div style={cardStyle} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <h3 style={titleStyle}><span>📊</span> Phân Tích & Tinh Chỉnh Cấu Trúc</h3>
                <div>
                    <span style={tagStyle}>Rietveld Refinement</span>
                    <span style={tagStyle}>Crystallography</span>
                    <span style={tagStyle}>XRD</span>
                </div>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '14.5px', lineHeight: '1.7', textAlign: 'justify' }}>
                    Sử dụng dữ liệu nhiễu xạ tia X (XRD) kết hợp với phương pháp tinh chỉnh cấu trúc tinh thể (Rietveld refinement) để xác định chính xác các thông số mạng, vị trí nguyên tử và định lượng pha, làm sáng tỏ bản chất vi cấu trúc của vật liệu mới.
                </p>
            </div>

            {/* Hướng 4: Tự động hóa & Phần mềm Lab */}
            <div style={cardStyle} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <h3 style={titleStyle}><span>💻</span> Tự Động Hóa & Thiết Kế Phần Mềm</h3>
                <div>
                    <span style={tagStyle}>Python Pipeline</span>
                    <span style={tagStyle}>PyQt6</span>
                    <span style={tagStyle}>Real-time Sensor</span>
                </div>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '14.5px', lineHeight: '1.7', textAlign: 'justify' }}>
                    Tiên phong xây dựng kiến trúc phần mềm (Python kết hợp PyQt6) để thiết lập các đường ống xử lý dữ liệu thời gian thực. Tự động hóa quá trình thu thập thông số từ phần cứng cảm biến trên các thiết bị kiểm tra thực nghiệm, nâng cao độ chính xác và hiệu suất nghiên cứu tại Lab.
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