
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
    const email = `antigravity.debug.${Date.now()}@gmail.com`;
    const password = "TestUser123";
    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };
    
    console.log(`Registering user: ${email}`);
    
    const registerData = JSON.stringify({
        name: "Test User",
        email: email,
        password: password,
        role: "user"
    });

    try {
        const registerRes = await request({
            hostname: 'hire-filter-backend.onrender.com',
            path: '/api/auth/signup',
            method: 'POST',
            headers: { ...headers, 'Content-Length': registerData.length }
        }, registerData);

        console.log(`Register Status: ${registerRes.statusCode}`);
        console.log(`Register Body: ${registerRes.body}`);

        if (registerRes.statusCode >= 400) {
            console.error("Registration failed, aborting login test.");
            return;
        }

        console.log("Attempting Login...");
        
        const loginData = JSON.stringify({
            email: email,
            password: password
        });

        const loginRes = await request({
            hostname: 'hire-filter-backend.onrender.com',
            path: '/api/auth/login',
            method: 'POST',
            headers: { ...headers, 'Content-Length': loginData.length }
        }, loginData);

        console.log(`Login Status: ${loginRes.statusCode}`);
        console.log(`Login Body: ${loginRes.body}`);

        try {
            const json = JSON.parse(loginRes.body);
            console.log("Parsed Login JSON:", json);
            if (!json.token) console.error("MISSING TOKEN");
            if (!json.role) console.error("MISSING ROLE");
            if (json.role !== 'user') console.error(`ROLE MISMATCH: Expected 'user', got '${json.role}'`);
        } catch (e) {
            console.error("Failed to parse login JSON");
        }

    } catch (err) {
        console.error("Error:", err);
    }
}

run();
