import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';

export default function InventoryTab({ session }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho form thêm vật tư mới
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Bột gốm');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('gram');
  const [minThreshold, setMinThreshold] = useState('');
  const [location, setLocation] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('inventory').select('*').order('item_name');
    if (error) toast.error("Lỗi tải kho: " + error.message);
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();

    // 🌟 LẮNG NGHE REALTIME THAY ĐỔI TRONG KHO (INVENTORY)
    const inventoryChannel = supabase.channel('realtime-inventory')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        (payload) => {
          fetchInventory(); // Tự động làm mới dữ liệu khi có thay đổi từ bất kỳ ai trong lab
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(inventoryChannel);
    };
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('inventory').insert([
      { 
        item_name: itemName, 
        category, 
        quantity: parseFloat(quantity), 
        unit, 
        min_threshold: parseFloat(minThreshold), 
        storage_location: location 
      }
    ]);
    if (error) {
      toast.error("Lỗi thêm vật tư: " + error.message);
      setLoading(false);
    } else {
      toast.success("Đã thêm thành công vào kho!");
      setItemName(''); setQuantity(''); setMinThreshold(''); setLocation('');
      fetchInventory();
    }
  };

  // Hàm cập nhật nhanh số lượng tồn kho khi sinh viên lấy dùng
  const handleUpdateQuantity = async (id, currentQty) => {
    const newQty = prompt("Nhập số lượng tồn kho mới:", currentQty);
    if (newQty === null || isNaN(newQty)) return;

    setLoading(true);
    const { error } = await supabase
      .from('inventory')
      .update({ quantity: parseFloat(newQty), updated_at: new Date() })
      .eq('id', id);

    if (error) {
      toast.error("Lỗi cập nhật: " + error.message);
      setLoading(false);
    } else {
      toast.success("Đã cập nhật số lượng kho!");
      fetchInventory();
    }
  };

  // Hàm xóa vật tư
  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vật tư [${name}] khỏi kho không?`)) return;

    setLoading(true);
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (error) {
      toast.error("Lỗi xóa: " + error.message);
      setLoading(false);
    } else {
      toast.success("Đã xóa vật tư thành công!");
      fetchInventory();
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative' }}>
      
      {/* 🌟 Hiệu ứng Loading Overlay chuẩn thiết kế ScheduleTab */}
      {loading && (
        <div style={{ 
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(3px)', 
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 10, gap: '10px',
            borderRadius: '16px'
        }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid rgba(0,86,179,0.2)', borderTopColor: '#0056b3', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            <span style={{ fontWeight: 'bold', color: '#0056b3', fontSize: '14px' }}>⏳ Đang xử lý dữ liệu kho...</span>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ color: '#111827', fontSize: '20px', fontWeight: '800', margin: 0 }}>
          📦 Quản lý Kho Hóa chất & Vật tư tiêu hao (Lab 211)
        </h2>
        <span style={{ fontSize: '13px', color: '#4b5563', backgroundColor: '#e0f2fe', padding: '4px 10px', borderRadius: '8px', fontWeight: '600' }}>
          ✨ Thành viên & Sinh viên có thể cập nhật kho trực tiếp
        </span>
      </div>
      
      {/* Form thêm mới hiển thị cho tất cả thành viên trong lab */}
      <form onSubmit={handleAddItem} style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', alignItems: 'end' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Tên vật tư / hóa chất:</label>
          <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Ví dụ: Bột ZrO2" required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Phân loại:</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
            <option value="Bột gốm">Bột gốm</option>
            <option value="Hóa chất">Hóa chất</option>
            <option value="Linh kiện">Linh kiện điện tử</option>
            <option value="Vật tư tiêu hao">Vật tư tiêu hao</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Số lượng tồn:</label>
          <input type="number" step="any" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="100" required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Đơn vị:</label>
          <input type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="gram, chiếc, ml" required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Ngưỡng báo động:</label>
          <input type="number" step="any" value={minThreshold} onChange={e => setMinThreshold(e.target.value)} placeholder="50" required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Vị trí cất:</label>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Tủ A2" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
        </div>
        <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', padding: '9px 16px', fontWeight: 'bold', cursor: 'pointer', height: '36px' }}>+ Thêm kho</button>
      </form>

      {/* Bảng danh sách kho */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left', fontSize: '13px', color: '#374151' }}>
              <th style={{ padding: '12px' }}>Tên vật tư</th>
              <th style={{ padding: '12px' }}>Phân loại</th>
              <th style={{ padding: '12px' }}>Tồn kho thực tế</th>
              <th style={{ padding: '12px' }}>Vị trí</th>
              <th style={{ padding: '12px' }}>Trạng thái cảnh báo</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '13px', color: '#1f2937' }}>
            {items.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Kho hiện chưa có vật tư nào.</td></tr>
            ) : items.map(item => {
              const isLow = item.quantity <= item.min_threshold;
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: isLow ? '#fef2f2' : 'transparent' }}>
                  <td style={{ padding: '12px', fontWeight: '600' }}>{item.item_name}</td>
                  <td style={{ padding: '12px' }}>{item.category}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: isLow ? '#dc2626' : '#111827' }}>
                    {item.quantity} {item.unit}
                  </td>
                  <td style={{ padding: '12px' }}>{item.storage_location || 'Chưa rõ'}</td>
                  <td style={{ padding: '12px' }}>
                    {isLow ? (
                      <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                        ⚠️ Sắp hết (Dưới {item.min_threshold} {item.unit}) - Cần mua sắm!
                      </span>
                    ) : (
                      <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                        Ổn định
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button 
                      onClick={() => handleUpdateQuantity(item.id, item.quantity)}
                      style={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', padding: '5px 10px', fontSize: '11.5px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      ✏️ Sửa số lượng
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item.id, item.item_name)}
                      style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '6px', padding: '5px 10px', fontSize: '11.5px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}