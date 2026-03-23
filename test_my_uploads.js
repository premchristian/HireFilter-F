const axios = require('axios');

async function testMyUploads() {
    try {
        console.log("Registering a candidate...");
        const email = `candidate_${Date.now()}@test.com`;
        const regRes = await axios.post('https://hire-filter-backend.onrender.com/api/auth/signup', {
            name: "Candidate Test",
            email: email,
            password: "Password123",
            role: "candidate" 
            // the backend originally complained about candidate role and required "user", let me use "user"
        });
        const token = regRes.data.token || regRes.data.data?.token;

        console.log("Calling my-uploads...");
        const uploadsRes = await axios.get('https://hire-filter-backend.onrender.com/api/users/my-uploads', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Uploads structure:", JSON.stringify(uploadsRes.data, null, 2));

    } catch (e) {
        console.log("Error:", e.response ? e.response.status : e.message);
        if (e.response && e.response.data) console.log(e.response.data);
    }
}
testMyUploads();
