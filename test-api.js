const axios = require('axios');

async function testApis() {
    try {
        console.log("--- TEST 1: Get All Jobs ---");
        const response1 = await axios.get("https://hire-filter-backend.onrender.com/api/jobs");
        console.log("Status:", response1.status);
        console.log("Keys:", Object.keys(response1.data));
        
        // Check for 'jobs' or 'data'
        if (response1.data.jobs) {
            console.log("Jobs count:", response1.data.jobs.length);
            console.log("Sample ID:", response1.data.jobs[0]?._id);
        } else if (response1.data.data) {
             console.log("Data count:", response1.data.data.length);
        } else {
            console.log("Unknown structure:", JSON.stringify(response1.data).substring(0, 100));
        }

        console.log("\n--- TEST 2: Get Single Job ---");
        const response2 = await axios.get("https://hire-filter-backend.onrender.com/api/jobs/698c20bb4e9e254128fbabf4");
        console.log("Status:", response2.status);
        console.log("Keys:", Object.keys(response2.data));
        console.log("Job Title:", response2.data.job?.jobTitle || response2.data.data?.jobTitle);

    } catch (error) {
        console.error("Error:", error.message);
    }
}

testApis();
