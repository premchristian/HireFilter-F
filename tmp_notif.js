const axios = require('axios');
const fs = require('fs');

async function test() {
    try {
        const token = fs.readFileSync('token.txt', 'utf8').trim();
        const baseUrl = "https://hire-filter-backend.onrender.com";
        
        // 1. Get notifications
        let res = await axios.get(`${baseUrl}/api/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const notifs = res.data?.data?.notifications || [];
        console.log(`Initial unread notifications: ${notifs.filter(n => !n.read).length}`);
        
        if (notifs.length > 0) {
            const firstUnread = notifs.find(n => !n.read);
            if (firstUnread) {
                console.log(`Marking notification ${firstUnread._id} as read...`);
                // 2. Mark specific notification as read
                const patchRes = await axios.patch(`${baseUrl}/api/notifications/${firstUnread._id}/read`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Patch response:', patchRes.status, patchRes.data);
                
                // 3. Get notifications again
                res = await axios.get(`${baseUrl}/api/notifications`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const notifsAfter = res.data?.data?.notifications || [];
                const checkNotif = notifsAfter.find(n => n._id === firstUnread._id);
                console.log(`Notification ${firstUnread._id} read status after reload:`, checkNotif?.read);
            } else {
                console.log("No unread notifications to test.");
            }
        }
    } catch (e) {
        console.error("Error:", e.response ? e.response.data : e.message);
    }
}

test();
