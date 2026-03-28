const axios = require('axios');

async function checkJobs() {
    try {
        // 1. Register/Login
        console.log("Logging in/Registering...");
        const randomStr = Math.random().toString(36).substring(7);
        const email = `test_hr_${randomStr}@example.com`;
        const password = "Password123";
        
        let token;
        try {
            const regRes = await axios.post('https://hire-filter-backend.onrender.com/api/auth/register', {
                name: "Test HR",
                email: email,
                password: password,
                role: "hr"
            });
            token = regRes.data.token || regRes.data.data.token;
        } catch (e) {
             console.log("Registration failed.");
             if (e.response) console.log("Reg Error:", e.response.data);
             
             // Fallback login
             try {
                const loginRes = await axios.post('https://hire-filter-backend.onrender.com/api/auth/login', {
                    email: "hr@gmail.com", 
                    password: "password"
                });
                token = loginRes.data.token || loginRes.data.data.token;
             } catch (err) {
                 console.error("Auth failed");
                 if (err.response) console.log("Login Error:", err.response.data);
                 return;
             }
        }

        // 2. Fetch jobs
        console.log("Fetching jobs...");
        const jobsRes = await axios.get('https://hire-filter-backend.onrender.com/api/jobs', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (jobsRes.data.data.length > 0) {
            const job = jobsRes.data.data[0];
            console.log("Full Job Object:", JSON.stringify(job, null, 2));
            console.log("Job ID:", job._id);
            console.log("Applicants Field:", job.applicants);
            console.log("Applicants Length:", job.applicants ? job.applicants.length : "N/A");
            
            // 3. Check if we can get applicants for this job via the other endpoint
            console.log("Checking fetching applicants via dedicated endpoint...");
            try {
                 const appRes = await axios.get(`https://hire-filter-backend.onrender.com/api/application/${job._id}/getAll`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("Dedicated Endpoint Count:", appRes.data.data ? appRes.data.data.length : 0);
            } catch (err) {
                console.error("Dedicated endpoint failed:", err.message);
            }

        } else {
            console.log("No jobs found to check.");
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
}

checkJobs();
