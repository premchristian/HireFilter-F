const axios = require('axios');

async function testEditJob() {
    try {
        console.log("Registering a test HR user...");
        const randomStr = Math.random().toString(36).substring(7);
        const email = `test_hr_${randomStr}@example.com`;
        const password = "Password123";
        
        let token;
        const regRes = await axios.post('https://hire-filter-backend.onrender.com/api/auth/signup', {
            name: "Test HR User",
            email: email,
            password: password,
            role: "hr"
        });
        token = regRes.data.token || regRes.data.data?.token;
        console.log("Registration successful");

        console.log("Creating a new job...");
        const createRes = await axios.post('https://hire-filter-backend.onrender.com/api/jobs', {
            jobTitle: "Test Software Engineer",
            department: "Engineering",
            jobType: "Full-Time",
            location: "Remote",
            jobDescription: "This is a test job description for the edit API test.",
            requiredSkills: ["React", "Node.js"],
            experience: { min: 2, max: 5 },
            salary: { min: 80000, max: 120000, currency: "USD" },
            education: "Graduate",
            lastDate: "2026-12-31"
        }, {
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        
        const newJobUrlId = createRes.data.data?._id || createRes.data._id || createRes.data.data?.id;
        console.log("Job created with ID:", newJobUrlId);

        console.log("Fetching jobs to get the full job object...");
        const jobsRes = await axios.get('https://hire-filter-backend.onrender.com/api/jobs', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const job = jobsRes.data.data.find(j => j._id === newJobUrlId || j.id === newJobUrlId);
        if (!job) {
            console.log("Could not fetch the newly created job.");
            return;
        }

        console.log("\n--- EXISITING JOB FIELDS ---")
        console.log(Object.keys(job));
        console.log("\n--- FULL JOB DATA ---");
        console.log(JSON.stringify(job, null, 2));

        console.log("\n--- TESTING EDIT API ---");
        const newTitle = job.title + " (Edited)";
        
        try {
            const editRes = await axios.put(`https://hire-filter-backend.onrender.com/api/jobs/${job._id || job.id}`, {
                ...job,
                title: newTitle,
                jobTitle: newTitle, // Some API schemas drift
                status: "Active"
            }, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            console.log("Edit successful! Status:", editRes.status);
            console.log("\n--- EDITED JOB FIELDS RETURNED ---");
            console.log(JSON.stringify(editRes.data, null, 2));

        } catch (e) {
            console.error("Edit failed:", e.response ? JSON.stringify(e.response.data, null, 2) : e.message);
        }

    } catch (e) {
        console.error("Test failed:", e.message);
        if (e.response) console.error(JSON.stringify(e.response.data, null, 2));
    }
}

testEditJob();
