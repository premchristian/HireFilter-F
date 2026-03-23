const axios = require('axios');

async function testFetchCandidateUploads() {
    try {
        console.log("Logging in as HR...");
        const loginRes = await axios.post('https://hire-filter-backend.onrender.com/api/auth/login', {
            email: "k@gmail.com",
            password: "Password123"
        });
        const token = loginRes.data.data.token;

        // I need an applicant ID. I'll just see what `/api/users/my-uploads` returns for HR.
        console.log("Fetching HR's my-uploads...");
        const uploadsRes = await axios.get('https://hire-filter-backend.onrender.com/api/users/my-uploads', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("HR Uploads:", uploadsRes.data.data);

        // Does my-uploads accept query string?
        console.log("Testing with query strings...");
        // I don't have a candidate user id handy here but I can try querying all users if it's an admin endpoint?
        // Or maybe I just add the API call to hr/applicants/[jobId]/[applicantId]/page.jsx and see if it works.

    } catch (e) {
        console.log("Error:", e.response ? e.response.status : e.message);
    }
}
testFetchCandidateUploads();
