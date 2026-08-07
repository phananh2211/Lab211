import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

async function sendFBMessage(psid, text) {
  const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient: { id: psid }, message: { text } })
  });
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
      return res.status(200).send(req.query['hub.challenge']);
    }
    return res.status(403).send('Forbidden');
  }

  if (req.method === 'POST') {
    const { body } = req;
    try {
      const messagingEvent = body.entry?.[0]?.messaging?.[0];
      if (!messagingEvent) return res.status(200).send('EVENT_RECEIVED');

      const psid = messagingEvent.sender.id;
      const text = messagingEvent.message?.text?.trim();

      if (!text) return res.status(200).send('EVENT_RECEIVED');

      // 1. Lệnh liên kết tài khoản: /link email@hust.edu.vn
      if (text.startsWith('/link ')) {
        const email = text.split(' ')[1];
        const { data } = await supabase
          .from('users')
          .update({ facebook_psid: psid })
          .eq('email', email)
          .select();
          
        await sendFBMessage(
          psid, 
          data?.length > 0 ? `✅ Đã liên kết thành công tài khoản với email: ${email}` : "❌ Không tìm thấy email này trong hệ thống."
        );
      } 
      // 2. Lệnh xem danh sách thiết bị và trạng thái: /thietbi
      else if (text === '/thietbi') {
        const { data: equipments } = await supabase.from('equipments').select('name, status');
        if (!equipments || equipments.length === 0) {
          await sendFBMessage(psid, "⚙️ Hiện chưa có thiết bị nào trong hệ thống.");
        } else {
          const msg = equipments.map(e => `🔹 ${e.name} - Trạng thái: ${e.status}`).join('\n');
          await sendFBMessage(psid, `📋 Danh sách thiết bị Lab 211:\n${msg}`);
        }
      }
      // 3. Lệnh tra cứu lịch đặt thiết bị: /lich
      else if (text === '/lich') {
        const { data: bookings } = await supabase
          .from('bookings')
          .select('start_time, end_time, user_email, equipments(name)');
        
        if (!bookings || bookings.length === 0) {
          await sendFBMessage(psid, "📅 Hiện tại không có lịch đặt thiết bị nào.");
        } else {
          const msg = bookings.map(b => 
            `⚙️ ${b.equipments?.name || 'Thiết bị'}\n   - Người đặt: ${b.user_email}\n   - Bắt đầu: ${new Date(b.start_time).toLocaleString('vi-VN')}`
          ).join('\n\n');
          await sendFBMessage(psid, `📋 Lịch đặt thiết bị sắp tới:\n\n${msg}`);
        }
      }
      // 4. Lệnh kiểm tra kho hóa chất/vật tư: /kho hoặc /vattu
      else if (text === '/kho' || text === '/vattu') {
        const { data: inventory } = await supabase.from('inventory').select('item_name, quantity, unit, min_threshold');
        if (!inventory || inventory.length === 0) {
          await sendFBMessage(psid, "📦 Kho hiện đang trống.");
        } else {
          const msg = inventory.map(i => {
            const warning = i.quantity <= i.min_threshold ? ' ⚠️ (Sắp hết)' : '';
            return `📦 ${i.item_name}: ${i.quantity} ${i.unit}${warning}`;
          }).join('\n');
          await sendFBMessage(psid, `🧪 Tình trạng kho hóa chất & vật tư Lab:\n${msg}`);
        }
      }
      // 5. Lệnh xem nhiệm vụ cá nhân: /task hoặc /congviec (Cần người dùng đã /link email)
      else if (text === '/task' || text === '/congviec') {
        // Tìm email dựa theo PSID đang nhắn tin
        const { data: userRecord } = await supabase.from('users').select('email').eq('facebook_psid', psid).single();
        if (!userRecord) {
          await sendFBMessage(psid, "⚠️ Tài khoản Messenger chưa được liên kết. Vui lòng gõ lệnh /link [email_cua_ban] trước.");
        } else {
          // Lấy các task phân công qua mảng assigned_to chứa email người dùng
          const { data: tasks } = await supabase.from('tasks').select('title, status, deadline').contains('assigned_to', [userRecord.email]);
          if (!tasks || tasks.length === 0) {
            await sendFBMessage(psid, "📝 Bạn hiện không có công việc nào được phân công.");
          } else {
            const msg = tasks.map(t => `📌 ${t.title}\n   - Trạng thái: ${t.status}\n   - Hạn: ${t.deadline ? new Date(t.deadline).toLocaleDateString('vi-VN') : 'Không có'}`).join('\n\n');
            await sendFBMessage(psid, `📝 Nhiệm vụ của bạn (${userRecord.email}):\n\n${msg}`);
          }
        }
      }
      // 6. Lệnh xem lịch trực lab: /trunglap hoặc /dutylevel
      else if (text === '/trunglap' || text === '/dutylevel') {
        const today = new Date().toISOString().split('T')[0];
        const { data: duties } = await supabase.from('duty_rosters').select('user_email, duty_date, status').gte('duty_date', today).limit(5);
        if (!duties || duties.length === 0) {
          await sendFBMessage(psid, "🧹 Không có lịch trực lab sắp tới.");
        } else {
          const msg = duties.map(d => `🧹 Ngày ${d.duty_date}: ${d.user_email} (${d.status})`).join('\n');
          await sendFBMessage(psid, `🧹 Lịch trực Lab 211 sắp tới:\n${msg}`);
        }
      }
      // Hướng dẫn mặc định khi gõ sai hoặc không đúng cú pháp
      else {
        await sendFBMessage(psid, 
          "🤖 Trợ lý ảo Lab 211 - Danh sách lệnh hỗ trợ:\n\n" +
          "🔹 /link [email] - Liên kết tài khoản Facebook với hệ thống Lab\n" +
          "🔹 /lich - Tra cứu lịch đặt thiết bị\n" +
          "🔹 /thietbi - Xem danh sách và trạng thái thiết bị\n" +
          "🔹 /kho - Kiểm tra tồn kho hóa chất & vật tư tiêu hao\n" +
          "🔹 /task - Xem các công việc/nhiệm vụ được phân công\n" +
          "🔹 /trunglap - Xem lịch trực vệ sinh và an toàn lab"
        );
      }
    } catch (err) {
      console.error('Lỗi xử lý webhook:', err);
    }
    return res.status(200).send('EVENT_RECEIVED');
  }
}