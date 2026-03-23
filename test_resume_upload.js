const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testUpload() {
    try {
        console.log("Registering temp user...");
        const randomStr = Math.random().toString(36).substring(7);
        const email = `test_upload_${randomStr}@example.com`;
        
        const regRes = await axios.post('https://hire-filter-backend.onrender.com/api/auth/signup', {
            name: "Test Upload",
            email: email,
            password: "P@ssw0rd123!",
            role: "user"
        });
        const token = regRes.data.token || regRes.data.data?.token;
        console.log("Got token");

        const form = new FormData();
        form.append('file', fs.createReadStream('package.json'));

        console.log("Testing /upload endpoint...");
        const uploadRes = await axios.post('https://hire-filter-backend.onrender.com/api/upload', form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });
        console.log("Success! Response:", uploadRes.data);
    } catch (e) {
        console.log("Error:", e.response ? Object.keys(e.response) : e.message);
        if (e.response) {
            console.log("Status:", e.response.status);
            console.log("Data:", e.response.data);
        }
    }
}
testUpload();
