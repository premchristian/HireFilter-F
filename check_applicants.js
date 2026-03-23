const axios = require('axios');

async function checkApplicants() {
    try {
        // 1. Register a new user to get a token
        console.log("Registering temp user...");
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
            console.log("Registered and got token.");
        } catch (e) {
            console.log("Registration failed.");
            console.error("Error Details:", e.response ? e.response.data : e.message);
            // Try login with hardcoded fallback just in case
            try {
                 console.log("Attempting fallback login with hr@gmail.com...");
                 const loginRes = await axios.post('https://hire-filter-backend.onrender.com/api/auth/login', {
                    email: "hr@gmail.com", 
                    password: "password"
                });
                token = loginRes.data.token || loginRes.data.data.token;
                console.log("Fallback login successful. Got token.");
            } catch (loginError) {
                 console.error("Fallback login also failed:", loginError.response ? loginError.response.data : loginError.message);
                 return;
            }
        }

        // 2. Get a job ID
        console.log("Fetching jobs...");
        const jobsRes = await axios.get('https://hire-filter-backend.onrender.com/api/jobs', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (jobsRes.data.data.length === 0) {
            console.log("No jobs found.");
            return;
        }

        const jobId = jobsRes.data.data[0]._id;
        console.log(`Checking applicants for Job ID: ${jobId}`);

        // 3. Fetch applicants
        const appRes = await axios.get(`https://hire-filter-backend.onrender.com/api/application/${jobId}/getAll`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Applicants Response Success:", appRes.data.success);
        
        if (appRes.data.data && appRes.data.data.length > 0) {
            const firstApplicant = appRes.data.data[0];
            console.log("First Applicant Object Keys:", Object.keys(firstApplicant));
            console.log("Full Applicant Object:", JSON.stringify(firstApplicant, null, 2));
            
            if (firstApplicant.score !== undefined) {
                console.log("Score found:", firstApplicant.score);
            } else {
                console.log("WARNING: 'score' field is MISSING in the response.");
            }
        } else {
            console.log("No applicants found for this job.");
        }

    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
    }
}

checkApplicants();
