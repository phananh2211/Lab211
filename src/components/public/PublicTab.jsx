export default function PublicTab({ onBack }) {
    const containerStyle = { padding: '30px', fontFamily: 'system-ui, sans-serif', maxHeight: '75vh', overflowY: 'auto' };
    const headingStyle = { color: '#1f2937', marginBottom: '20px', fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px' };
    const textStyle = { color: '#4b5563', lineHeight: '1.8', marginBottom: '25px', fontSize: '15px', textAlign: 'justify' };
    const cardStyle = { backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', transition: 'transform 0.2s', position: 'relative', overflow: 'hidden' };
    const titleStyle = { margin: '0 0 12px 0', color: '#111827', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' };
    const buttonStyle = { padding: '12px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' };
    const highlightBarStyle = { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%' };
    
    // Style cho phần placeholder chờ cập nhật link
    const placeholderStyle = { marginTop: '15px', padding: '12px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b', fontSize: '13.5px', fontStyle: 'italic' };

    return (
        <div style={containerStyle}>
            <h2 style={headingStyle}>📚 Bài Báo & Công Bố Khoa Học</h2>
            <p style={textStyle}>
                Các kết quả nghiên cứu của tập thể cán bộ, học viên và sinh viên tại Lab 211 thường xuyên được công bố trên các tạp chí khoa học quốc tế uy tín, cũng như trình bày tại các hội nghị chuyên ngành về Khoa học và Kỹ thuật Vật liệu. 
                <br/>
                <i>(Danh sách chi tiết các công trình đang trong quá trình cập nhật và hệ thống hóa).</i>
            </p>

            {/* Mục 1: Tạp chí Quốc tế */}
            <div style={cardStyle} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{...highlightBarStyle, backgroundColor: '#3b82f6'}}></div>
                <h3 style={titleStyle}><span>📑</span> Tạp Chí Quốc Tế (ISI / Scopus)</h3>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '14.5px', lineHeight: '1.7' }}>
                    Các công bố tập trung vào mảng cốt lõi của Lab như: tối ưu hóa vi cấu trúc vật liệu bằng công nghệ thiêu kết tia lửa plasma (SPS), phân tích tinh chỉnh cấu trúc (Rietveld refinement) và đánh giá độ mỏi của các hệ gốm áp điện (BNT-BT, PZT).
                </p>
                <div style={placeholderStyle}>
                    [ Vùng chờ: Bạn sẽ cập nhật các link bài báo quốc tế (DOI) của cô Ngọc, cô Thảo và lab tại đây... ]
                </div>
            </div>

            {/* Mục 2: Hội nghị & Hội thảo */}
            <div style={cardStyle} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{...highlightBarStyle, backgroundColor: '#10b981'}}></div>
                <h3 style={titleStyle}><span>🎤</span> Kỷ Yếu Hội Nghị & Hội Thảo Khoa Học</h3>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '14.5px', lineHeight: '1.7' }}>
                    Các báo cáo chuyên đề và poster khoa học được trình bày tại Hội nghị Vật lý Chất rắn, Hội nghị Khoa học Vật liệu toàn quốc và các diễn đàn học thuật quốc tế.
                </p>
                <div style={placeholderStyle}>
                    [ Vùng chờ: Cập nhật danh sách các báo cáo hội nghị, link kỷ yếu proceedings... ]
                </div>
            </div>

            {/* Mục 3: Đồ án & Luận văn */}
            <div style={cardStyle} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{...highlightBarStyle, backgroundColor: '#8b5cf6'}}></div>
                <h3 style={titleStyle}><span>🎓</span> Luận Văn Thạc Sĩ & Đồ Án Tốt Nghiệp</h3>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '14.5px', lineHeight: '1.7' }}>
                    Tuyển tập các đồ án tốt nghiệp xuất sắc và luận văn Thạc sĩ mang tính ứng dụng cao được thực hiện tại Lab 211, bao gồm cả các hướng nghiên cứu kết hợp giữa vật liệu học và lập trình phần mềm tự động hóa thiết bị.
                </p>
                <div style={placeholderStyle}>
                    [ Vùng chờ: Liệt kê tên các đồ án/luận văn tiêu biểu của học viên, sinh viên... ]
                </div>
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