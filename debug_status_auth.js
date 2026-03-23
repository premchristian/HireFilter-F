const axios = require('axios');

async function testStatusWithAuth() {
    try {
        console.log("Logging in as HR...");
        const loginRes = await axios.post('https://hire-filter-backend.onrender.com/api/auth/login', {
            email: "k@gmail.com",
            password: "Password123"
        });
        const token = loginRes.data.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const baseUrl = "https://hire-filter-backend.onrender.com";
        const appId = "697637f69393fa32d3be5924"; 
        const url = `${baseUrl}/api/application/${appId}/status`;

        console.log(`Testing PUT to ${url}...`);
        try {
            const res = await axios.put(url, { status: "shortlisted" }, config);
            console.log("PUT Result:", res.status, res.data);
        } catch (e) {
            console.log("PUT Error:", e.response ? e.response.status : e.message, e.response ? e.response.data : "");
        }

        console.log(`Testing POST to ${url}...`);
        try {
            const res = await axios.post(url, { status: "shortlisted" }, config);
            console.log("POST Result:", res.status, res.data);
        } catch (e) {
            console.log("POST Error:", e.response ? e.response.status : e.message, e.response ? e.response.data : "");
        }

        console.log(`Testing PATCH to ${url}...`);
        try {
            const res = await axios.patch(url, { status: "shortlisted" }, config);
            console.log("PATCH Result:", res.status, res.data);
        } catch (e) {
            console.log("PATCH Error:", e.response ? e.response.status : e.message, e.response ? e.response.data : "");
        }

    } catch (e) {
        console.log("General Error:", e.message);
    }
}

testStatusWithAuth();
