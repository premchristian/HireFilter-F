const axios = require('axios');
const fs = require('fs');
const token = fs.readFileSync('token.txt', 'utf8').trim() || "";
axios.get('https://hire-filter-backend.onrender.com/api/messages/previous-conversations', {
    headers: { Authorization: `Bearer ${token}` }
}).then(res => {
    console.log(JSON.stringify(res.data, null, 2));
}).catch(e => console.log(e.response ? e.response.data : e.message));
