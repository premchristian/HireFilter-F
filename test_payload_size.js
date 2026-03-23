const axios = require('axios');

async function testLargePayload() {
    try {
        console.log("Registering temp user...");
        const randomStr = Math.random().toString(36).substring(7);
        const email = `test_payload_${randomStr}@example.com`;
        
        const regRes = await axios.post('https://hire-filter-backend.onrender.com/api/auth/signup', {
            name: "Test Payload",
            email: email,
            password: "P@ssw0rd123!",
            role: "user"
        });
        const token = regRes.data.token || regRes.data.data?.token;

        console.log("Preparing 1MB string...");
        const largeStr = "A".repeat(1024 * 1024); // 1MB string

        console.log("Sending to updateProfile...");
        const updateRes = await axios.put('https://hire-filter-backend.onrender.com/api/users/updateProfile', {
            profile: {
                resumeLink: largeStr
            }
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Success! Backend accepts 1MB payloads.", updateRes.data.message || "");
    } catch (e) {
        console.log("Error:", e.response ? e.response.status : e.message);
        if (e.response && e.response.data) console.log(e.response.data);
    }
}
testLargePayload();
