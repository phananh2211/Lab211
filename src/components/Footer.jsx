export default function Footer({ onSelectTab }) {
    return (
        <footer style={{ 
            width: '100%', 
            backgroundColor: '#0f172a', 
            borderTop: '1px solid rgba(59, 130, 246, 0.3)', 
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: '#94a3b8',
            fontSize: '14px',
            lineHeight: '1.7',
            boxSizing: 'border-box',
            marginTop: 'auto', 
            boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.2)'
        }}>
            {/* Container giới hạn nội dung bên trong căn giữa đúng chuẩn 1200px */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '40px', boxSizing: 'border-box' }}>
                
                {/* Cột 1: Thông tin định danh Lab + Logo + Fanpage */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ 
                            backgroundColor: '#ffffff', 
                            padding: '8px', 
                            borderRadius: '12px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                            <img 
                                src={`${import.meta.env.BASE_URL}211.png`} 
                                alt="Logo Bách khoa" 
                                style={{ width: '38px', height: '38px', objectFit: 'contain' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                        <div>
                            <div style={{ fontWeight: '800', fontSize: '17px', color: '#ffffff', letterSpacing: '-0.025em' }}>
                                HỆ THỐNG LAB 211
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#38bdf8', fontWeight: '600' }}>
                                Khoa học & Kỹ thuật Vật liệu
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '500', lineHeight: '1.6' }}>
                        Trường Vật liệu — Đại học Bách khoa Hà Nội<br/>
                        <a 
                            href="https://smse.hust.edu.vn" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                                color: '#38bdf8', 
                                textDecoration: 'none',
                                transition: 'color 0.2s ease',
                                cursor: 'pointer',
                                display: 'inline-block',
                                marginTop: '2px'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = '#7dd3fc'}
                            onMouseLeave={e => e.currentTarget.style.color = '#38bdf8'}
                        >
                            🌐 Trang chủ Khoa/Trường
                        </a>
                        <br/>
                        <a 
                            href="https://www.facebook.com/smse.hust/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                                color: '#60a5fa', 
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginTop: '6px',
                                fontSize: '12.5px',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                border: '1px solid rgba(59, 130, 246, 0.2)'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                                e.currentTarget.style.color = '#93c5fd';
                            }} 
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                                e.currentTarget.style.color = '#60a5fa';
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                            Fanpage Trường Vật liệu
                        </a>
                    </div>
                    
                    <div style={{ fontSize: '12px', color: '#64748b', borderLeft: '2px solid #334151', paddingLeft: '10px' }}>
                        Nền tảng quản lý thông minh phục vụ nghiên cứu khoa học và vận hành thiết bị tại lab 211C5.
                    </div>
                </div>

                {/* Cột 2: Các tab chuyển đổi công khai */}
                <div>
                    <div style={{ fontWeight: '700', color: '#ffffff', marginBottom: '16px', fontSize: '13.5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Khám phá & Giới thiệu
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                            { id: 'about', label: 'Giới thiệu Lab 211' },
                            { id: 'research', label: 'Lĩnh vực nghiên cứu cốt lõi' },
                            { id: 'projects_info', label: 'Hợp tác nghiên cứu & Dự án' },
                            { id: 'public_documents', label: 'Bài báo & Công bố' },
                            { id: 'terms', label: 'Điều khoản sử dụng' },
                            { id: 'privacy', label: 'Chính sách bảo mật' }
                        ].map((item) => (
                            <li key={item.id}>
                                <button 
                                    onClick={() => {
                                        if (onSelectTab) onSelectTab(item.id);
                                    }} 
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        color: '#94a3b8', 
                                        cursor: 'pointer', 
                                        padding: '4px 0', 
                                        fontSize: '13px', 
                                        textAlign: 'left', 
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        width: '100%'
                                    }} 
                                    onMouseEnter={e => {
                                        e.currentTarget.style.color = '#38bdf8';
                                        e.currentTarget.style.transform = 'translateX(6px)';
                                    }} 
                                    onMouseLeave={e => {
                                        e.currentTarget.style.color = '#94a3b8';
                                        e.currentTarget.style.transform = 'translateX(0)';
                                    }}
                                >
                                    <span style={{ fontSize: '9px', color: '#38bdf8' }}>✦</span> {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Cột 3: Thông tin liên hệ & Hỗ trợ kỹ thuật */}
                <div>
                    <div style={{ fontWeight: '700', color: '#ffffff', marginBottom: '16px', fontSize: '13.5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Liên hệ & Trợ giúp
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#cbd5e1', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <span style={{ marginTop: '2px' }}>📍</span>
                            <span>Phòng 211, Tòa nhà C5, 1 Đ. Đại Cồ Việt, Bách Khoa, Hai Bà Trưng, Hà Nội</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>📞</span>
                            <span>(+84) 24 3869 XXXX</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>✉️</span>
                            <a href="mailto:anh.p237957@sis.hust.edu.vn" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: '500' }}>anh.p237957@sis.hust.edu.vn</a>
                        </div>
                    </div>
                    
                    <div style={{ marginTop: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                        <span style={{ display: 'inline-block', width: '7px', height: '7px', backgroundColor: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }}></span>
                        <span style={{ fontSize: '11.5px', color: '#34d399', fontWeight: '700' }}>Hệ thống vận hành bình thường (v1.0)</span>
                    </div>
                </div>

            </div>

            {/* Dòng bản quyền phía dưới cùng */}
            <div style={{ backgroundColor: '#090d16', padding: '20px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', boxSizing: 'border-box' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', fontSize: '12px', color: '#64748b', boxSizing: 'border-box' }}>
                    <div>
                        © {new Date().getFullYear()} Lab 211 — Đại học Bách khoa Hà Nội. All rights reserved.
                    </div>
                    
                    {/* Khu vực chứa liên kết chính sách và Nút chuyển đổi ngôn ngữ ở góc phải */}
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <span 
                                onClick={() => { if (onSelectTab) onSelectTab('privacy'); }}
                                style={{ cursor: 'pointer', transition: 'color 0.2s' }} 
                                onMouseEnter={e => e.target.style.color = '#fff'} 
                                onMouseLeave={e => e.target.style.color = '#64748b'}
                            >
                                Bảo mật thông tin
                            </span>
                            <span>•</span>
                            <span 
                                onClick={() => { if (onSelectTab) onSelectTab('terms'); }}
                                style={{ cursor: 'pointer', transition: 'color 0.2s' }} 
                                onMouseEnter={e => e.target.style.color = '#fff'} 
                                onMouseLeave={e => e.target.style.color = '#64748b'}
                            >
                                Điều khoản sử dụng
                            </span>
                        </div>

                        {/* Nút bấm chuyển đổi ngôn ngữ tích hợp Google Translate Widget */}
                        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#1e293b', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <button 
                                onClick={() => window.changeLanguage && window.changeLanguage('vi')}
                                style={{ background: 'transparent', border: 'none', color: '#cbd5e1', fontSize: '11.5px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.target.style.backgroundColor = '#334151'; e.target.style.color = '#fff'; }}
                                onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#cbd5e1'; }}
                                title="Chuyển sang Tiếng Việt"
                            >
                                VN vi
                            </button>
                            <button 
                                onClick={() => window.changeLanguage && window.changeLanguage('en')}
                                style={{ background: 'transparent', border: 'none', color: '#cbd5e1', fontSize: '11.5px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.target.style.backgroundColor = '#334151'; e.target.style.color = '#fff'; }}
                                onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#cbd5e1'; }}
                                title="Switch to English"
                            >
                                EN en
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}