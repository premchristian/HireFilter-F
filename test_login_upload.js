const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testUpload() {
    try {
        console.log("Logging in as k@gmail.com...");
        const loginRes = await axios.post('https://hire-filter-backend.onrender.com/api/auth/login', {
            email: "k@gmail.com",
            password: "Password123"
        });
        const token = loginRes.data.data.token;

        console.log("Fetching initial profile...");
        let profileRes = await axios.get('https://hire-filter-backend.onrender.com/api/users/getProfile', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const initialAvatar = profileRes.data.data?.profileImage || profileRes.data.data?.profile?.image;
        console.log("Initial Avatar:", initialAvatar);

        const form = new FormData();
        form.append('profileImage', fs.createReadStream('package.json'));

        console.log("Uploading package.json to /upload-profile-image...");
        const uploadRes = await axios.post('https://hire-filter-backend.onrender.com/api/users/upload-profile-image', form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });
        const url = uploadRes.data.data?.profileImage || uploadRes.data.profileImage;
        console.log("Upload Success! Response URL:", url);

        console.log("Fetching profile again...");
        profileRes = await axios.get('https://hire-filter-backend.onrender.com/api/users/getProfile', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const newAvatar = profileRes.data.data?.profileImage || profileRes.data.data?.profile?.image;
        console.log("New Avatar:", newAvatar);

        if (initialAvatar !== newAvatar) {
            console.log("DB CHANGED! We cannot use this endpoint without corrupting avatars.");
        } else {
            console.log("DB DID NOT CHANGE! We CAN use this endpoint as a generic bucket!");
        }

    } catch (e) {
        console.log("Error:", e.response ? e.response.status : e.message);
        if (e.response && e.response.data) console.log(e.response.data);
    }
}
testUpload();
