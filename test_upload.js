const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testUpload() {
    try {
        console.log("Registering temp user...");
        const randomStr = Math.random().toString(36).substring(7);
        const email = `test_upload_${randomStr}@example.com`;
        
        const regRes = await axios.post('https://hire-filter-backend.onrender.com/api/auth/register', {
            name: "Test Upload",
            email: email,
            password: "Password123",
            role: "candidate"
        });
        const token = regRes.data.token || regRes.data.data.token;
        console.log("Got token");

        const form = new FormData();
        form.append('profileImage', fs.createReadStream('package.json'));

        console.log("Testing /upload-profile-image...");
        const uploadRes = await axios.post('https://hire-filter-backend.onrender.com/api/users/upload-profile-image', form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });
        console.log("Success! Response:", uploadRes.data);
    } catch (e) {
        console.log("Error:", e.response ? e.response.data : e.message);
    }
}
testUpload();
