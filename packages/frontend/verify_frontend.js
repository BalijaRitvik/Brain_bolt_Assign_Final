const http = require('http');

function checkUrl(path) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:3001${path}`, (res) => {
            console.log(`GET ${path}: Status ${res.statusCode}`);
            if (res.statusCode >= 200 && res.statusCode < 400) {
                resolve();
            } else {
                reject(new Error(`Status ${res.statusCode}`));
            }
        }).on('error', (e) => {
            console.error(`GET ${path} failed:`, e.message);
            reject(e);
        });
    });
}

async function verify() {
    try {
        console.log('Verifying Frontend...');
        await checkUrl('/');
        await checkUrl('/leaderboard');
        console.log('Verification Passed: Frontend is serving pages.');
    } catch (err) {
        console.error('Verification Failed');
        process.exit(1);
    }
}

verify();
