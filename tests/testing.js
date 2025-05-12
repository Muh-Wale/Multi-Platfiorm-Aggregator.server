const http = require('http');
const { URL } = require('url');

// Configuration
const BASE_URL = 'http://localhost:5000'; // Update with your server's URL
const TEST_USER = {
    email: 'test@example.com',
    password: 'testpassword'
};
let authToken = '';

// Helper functions
function makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port || 80,
            path: url.pathname,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : {};
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: parsed
                    });
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (error) => reject(error));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log('Starting API tests...\n');

    // 1. Test debug route (public)
    try {
        console.log('Testing /debug route...');
        const debugRes = await makeRequest('GET', '/api/user/debug');
        console.log(`Status: ${debugRes.status}`);
        console.log('Response:', debugRes.body);
        console.log('---\n');
    } catch (err) {
        console.error('Debug route test failed:', err);
    }

    // 2. Test registration
    try {
        console.log('Testing user registration...');
        const registerRes = await makeRequest('POST', '/api/user/register', {
            email: TEST_USER.email,
            password: TEST_USER.password
        });
        console.log(`Status: ${registerRes.status}`);
        console.log('---\n');
    } catch (err) {
        console.error('Registration test failed:', err.message);
    }

    // 3. Test login
    try {
        console.log('Testing login...');
        const loginRes = await makeRequest('POST', '/api/user/login', {
            email: TEST_USER.email,
            password: TEST_USER.password
        });

        if (loginRes.headers['set-cookie']) {
            authToken = loginRes.headers['set-cookie'][0].split(';')[0].split('=')[1];
        } else if (loginRes.body.token) {
            authToken = loginRes.body.token;
        }

        console.log(`Status: ${loginRes.status}`);
        console.log('Auth token:', authToken ? 'Received' : 'Missing');
        console.log('---\n');
    } catch (err) {
        console.error('Login test failed:', err.message);
    }

    // 4. Test protected profile route
    if (authToken) {
        try {
            console.log('Testing protected profile route...');
            const profileRes = await makeRequest('GET', '/api/user/profile', null, {
                'Authorization': `Bearer ${authToken}`
            });
            console.log(`Status: ${profileRes.status}`);
            console.log('User profile:', profileRes.body);
            console.log('---\n');
        } catch (err) {
            console.error('Profile route test failed:', err.message);
        }
    }

    // 5. Test query submission
    if (authToken) {
        try {
            console.log('Testing query submission...');
            const queryRes = await makeRequest('POST', '/api/queries', {
                text: 'Test query from automated test',
                platforms: ['reddit']
            }, {
                'Authorization': `Bearer ${authToken}`
            });
            console.log(`Status: ${queryRes.status}`);
            console.log('Created query:', queryRes.body);
            console.log('---\n');
        } catch (err) {
            console.error('Query submission test failed:', err.message);
        }
    }

    // 6. Test query history
    if (authToken) {
        try {
            console.log('Testing query history...');
            const historyRes = await makeRequest('GET', '/api/user/history', null, {
                'Authorization': `Bearer ${authToken}`
            });
            console.log(`Status: ${historyRes.status}`);
            console.log('Query history:', historyRes.body.length, 'items');
            console.log('---\n');
        } catch (err) {
            console.error('History route test failed:', err.message);
        }
    }

    console.log('Testing complete!');
}

// Run all tests
runTests().catch(console.error);