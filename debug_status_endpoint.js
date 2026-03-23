const axios = require('axios');

async function testStatusEndpoint() {
    const baseUrl = "https://hire-filter-backend.onrender.com";
    const appId = "697637f69393fa32d3be5924"; // ID from user's message
    const url = `${baseUrl}/api/application/${appId}/status`;
    
    console.log(`Testing PUT to ${url}...`);
    try {
        const putRes = await axios.put(url, { status: "shortlisted" });
        console.log("PUT Result:", putRes.status);
    } catch (e) {
        console.log("PUT Error:", e.response ? e.response.status : e.message);
    }

    console.log(`Testing POST to ${url}...`);
    try {
        const postRes = await axios.post(url, { status: "shortlisted" });
        console.log("POST Result:", postRes.status);
    } catch (e) {
        console.log("POST Error:", e.response ? e.response.status : e.message);
    }

    console.log(`Testing PATCH to ${url}...`);
    try {
        const patchRes = await axios.patch(url, { status: "shortlisted" });
        console.log("PATCH Result:", patchRes.status);
    } catch (e) {
        console.log("PATCH Error:", e.response ? e.response.status : e.message);
    }
}

testStatusEndpoint();
