import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
    const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Missing Supabase environment variables' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    async function sendFBMessage(psid, text) {
      if (!PAGE_ACCESS_TOKEN) return;
      const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: { id: psid }, message: { text } })
      });
    }

    if (req.method === 'GET') {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
      }
      return res.status(403).send('Forbidden: Verify token mismatch');
    }

    if (req.method === 'POST') {
      const { body } = req;
      const messagingEvent = body.entry?.[0]?.messaging?.[0];
      if (!messagingEvent) return res.status(200).send('EVENT_RECEIVED');

      const psid = messagingEvent.sender.id;
      const text = messagingEvent.message?.text?.trim();

      if (!text) return res.status(200).send('EVENT_RECEIVED');

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
      else if (text === '/thietbi') {
        const { data: equipments } = await supabase.from('equipments').select('name, status');
        if (!equipments || equipments.length === 0) {
          await sendFBMessage(psid, "⚙️ Hiện chưa có thiết bị nào trong hệ thống.");
        } else {
          const msg = equipments.map(e => `🔹 ${e.name} - Trạng thái: ${e.status}`).join('\n');
          await sendFBMessage(psid, `📋 Danh sách thiết bị Lab 211:\n${msg}`);
        }
      }
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
      else if (text === '/task' || text === '/congviec') {
        const { data: userRecord } = await supabase.from('users').select('email').eq('facebook_psid', psid).single();
        if (!userRecord) {
          await sendFBMessage(psid, "⚠️ Tài khoản Messenger chưa được liên kết. Vui lòng gõ lệnh /link [email_cua_ban] trước.");
        } else {
          const { data: tasks } = await supabase.from('tasks').select('title, status, deadline').contains('assigned_to', [userRecord.email]);
          if (!tasks || tasks.length === 0) {
            await sendFBMessage(psid, "📝 Bạn hiện không có công việc nào được phân công.");
          } else {
            const msg = tasks.map(t => `📌 ${t.title}\n   - Trạng thái: ${t.status}\n   - Hạn: ${t.deadline ? new Date(t.deadline).toLocaleDateString('vi-VN') : 'Không có'}`).join('\n\n');
            await sendFBMessage(psid, `📝 Nhiệm vụ của bạn (${userRecord.email}):\n\n${msg}`);
          }
        }
      }
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

      return res.status(200).send('EVENT_RECEIVED');
    }

    return res.status(405).send('Method Not Allowed');
  } catch (err) {
    console.error('Webhook Error:', err);
    return res.status(500).json({ error: err.message });
  }
}