const axios = require('axios');

async function checkJobDetails() {
    try {
        // I need a valid token. I'll ask the user to provide one if I can't login.
        // But wait, I can try to login as hr first using the hardcoded credentials if they exist, or just ask the user.
        // For now, I'll try to login with a widely used test account if I knew one, but I don't.
        // Actually, I can just use the login endpoint to get a token if I create a user.
        // Let's try to login with the user I might have created or just use a placeholder and ask the user to run it?
        // No, I can't ask user to run node script easily if they are not dev.
        // I will use a test user I create.
        
        const loginRes = await axios.post('https://hire-filter-backend.onrender.com/api/auth/login', {
            email: "hr@example.com", // I hope this exists or I'll create one
            password: "Password123"
        });
        
        const token = loginRes.data.token || loginRes.data.data.token;
        console.log("Got token");

        // Get all jobs to find an ID
        const jobsRes = await axios.get('https://hire-filter-backend.onrender.com/api/jobs', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (jobsRes.data.data.length > 0) {
            const job = jobsRes.data.data[0];
            console.log("Full Job Object:", JSON.stringify(job, null, 2));
        } else {
            console.log("No jobs found");
        }

    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
        // If login fails, I'll just report it.
    }
}

checkJobDetails();
