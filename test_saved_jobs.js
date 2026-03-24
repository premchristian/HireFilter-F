const https = require('https');

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: body }));
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function run() {
    const email = `antigravity.debug.save.${Date.now()}@gmail.com`;
    const password = "TestUser123";
    const headers = { 'Content-Type': 'application/json' };
    
    console.log("Registering...", email);
    const registerData = JSON.stringify({ name: "Test User", email: email, password: password, role: "user" });
    await request({ hostname: 'hire-filter-backend.onrender.com', path: '/api/auth/signup', method: 'POST', headers: { ...headers, 'Content-Length': registerData.length } }, registerData);
    
    console.log("Logging in...");
    const loginData = JSON.stringify({ email: email, password: password });
    const loginRes = await request({ hostname: 'hire-filter-backend.onrender.com', path: '/api/auth/login', method: 'POST', headers: { ...headers, 'Content-Length': loginData.length } }, loginData);
    const token = JSON.parse(loginRes.body).token;
    if (!token) { console.log("Login failed", loginRes.body); return; }

    console.log("Fetching empty saved jobs...");
    const savedRes = await request({ hostname: 'hire-filter-backend.onrender.com', path: '/api/jobs/saved', method: 'GET', headers: { 'Authorization': `Bearer ${token}` } });
    console.log("Empty Saved:", savedRes.statusCode, savedRes.body);

    console.log("Fetching public jobs to save one...");
    const jobsRes = await request({ hostname: 'hire-filter-backend.onrender.com', path: '/api/jobs', method: 'GET', headers: { 'Authorization': `Bearer ${token}` } });
    const jobsBody = JSON.parse(jobsRes.body);
    const jobsArray = jobsBody.data || jobsBody.jobs || jobsBody;
    
    if (jobsArray && jobsArray.length > 0) {
        const jobId = jobsArray[0]._id;
        console.log("Saving job:", jobId);
        const toggleRes = await request({ hostname: 'hire-filter-backend.onrender.com', path: `/api/jobs/toggle-save/${jobId}`, method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
        console.log("Toggle Status:", toggleRes.statusCode);

        console.log("Fetching populated saved jobs...");
        const savedRes2 = await request({ hostname: 'hire-filter-backend.onrender.com', path: '/api/jobs/saved', method: 'GET', headers: { 'Authorization': `Bearer ${token}` } });
        console.log("Populated Saved:", savedRes2.statusCode, savedRes2.body);
    } else {
        console.log("No jobs found to save.");
    }
}
run();
