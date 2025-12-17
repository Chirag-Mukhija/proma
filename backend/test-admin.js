const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function runTests() {
    console.log('🚀 Starting Admin Logic Tests...');
    try {
        const timestamp = Date.now();
        const adminEmail = `admin${timestamp}@example.com`;
        const userEmail = `user${timestamp}@example.com`;

        // 1. Register Admin
        console.log(`\n1. Registering Admin: ${adminEmail}`);
        const adminRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Admin User',
            email: adminEmail,
            password: 'password123'
        });
        const adminToken = adminRes.data.token;
        const adminId = adminRes.data._id;
        console.log('✅ Admin Registered');

        // 2. Register User B
        console.log(`\n2. Registering User B: ${userEmail}`);
        const userRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Normal User',
            email: userEmail,
            password: 'password123'
        });
        const userToken = userRes.data.token;
        const userId = userRes.data._id;
        console.log('✅ User B Registered');

        // 3. Admin creates Project
        console.log('\n3. Admin creating project...');
        const projectRes = await axios.post(`${API_URL}/projects`, {
            title: 'Admin Test Project',
            description: 'Testing multi-admin',
            status: 'planning'
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        const projectId = projectRes.data._id;
        console.log('✅ Project Created:', projectId);

        // 4. User B requests join
        console.log('\n4. User B requesting join...');
        await axios.post(`${API_URL}/projects/${projectId}/join`, {}, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('✅ Join Request Sent');

        // 5. Admin accepts User B
        console.log('\n5. Admin accepting User B...');
        await axios.post(`${API_URL}/projects/${projectId}/accept-invite`,
            { userId },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log('✅ User B Accepted');

        // 6. Admin makes User B Admin
        console.log('\n6. Admin promoting User B...');
        await axios.post(`${API_URL}/projects/${projectId}/make-admin`,
            { userId },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log('✅ User B Promoted to Admin');

        // 7. User B tries to update project (should succeed)
        console.log('\n7. User B updating project status...');
        const updateRes = await axios.put(`${API_URL}/projects/${projectId}`,
            { status: 'in-progress' },
            { headers: { Authorization: `Bearer ${userToken}` } }
        );
        console.log('✅ Project Updated by User B:', updateRes.data.status);

        if (updateRes.data.status === 'in-progress') {
            console.log('\n🎉 ALL ADMIN TESTS PASSED!');
        } else {
            console.error('\n❌ FAILED: Status did not update.');
        }

    } catch (err) {
        if (err.response) {
            console.error('❌ Failed:', err.response.status, err.response.data);
        } else {
            console.error('❌ Network/Client Error:', err.message);
        }
    }
}

runTests();
