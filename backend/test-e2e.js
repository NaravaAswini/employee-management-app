import http from 'http';

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: JSON.parse(body)
          });
        } catch {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Fullstack Employee Management E2E Test Suite...\n');
  const baseUrl = 'http://localhost:5000';
  let token = '';
  let createdEmpId = null;

  try {
    // 1. Healthcheck
    console.log('1️⃣ Testing GET /api/health...');
    const health = await request({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
    console.log(`   Status: ${health.statusCode}, DB Mode: ${health.data.database}`);
    if (health.statusCode !== 200) throw new Error('Healthcheck failed');

    // 2. Auth: Register with invalid email
    console.log('\n2️⃣ Testing Register with Invalid Email (spaces)...');
    const invalidEmailRes = await request(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { name: 'Test User', email: 'test user@example.com', password: 'Password123!' }
    );
    console.log(`   Response (${invalidEmailRes.statusCode}): ${invalidEmailRes.data.message}`);
    if (invalidEmailRes.statusCode !== 400) throw new Error('Invalid email should be rejected');

    // 3. Auth: Register with weak password
    console.log('\n3️⃣ Testing Register with Weak Password (no special symbol)...');
    const weakPassRes = await request(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { name: 'Test User', email: 'valid.test@example.com', password: 'Password123' }
    );
    console.log(`   Response (${weakPassRes.statusCode}): ${weakPassRes.data.message}`);
    if (weakPassRes.statusCode !== 400) throw new Error('Weak password should be rejected');

    // 4. Auth: Register with valid credentials
    const testEmail = `admin.${Date.now()}@company.com`;
    console.log(`\n4️⃣ Testing Register with Valid Credentials (${testEmail})...`);
    const validRegisterRes = await request(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { name: 'Admin Manager', email: testEmail, password: 'SecurePassword123!' }
    );
    console.log(`   Response (${validRegisterRes.statusCode}): ${validRegisterRes.data.message}`);
    if (validRegisterRes.statusCode !== 201 || !validRegisterRes.data.token) {
      throw new Error('Registration failed');
    }
    token = validRegisterRes.data.token;
    console.log(`   ✅ JWT Token received: ${token.substring(0, 20)}...`);

    // 5. Auth: Login
    console.log('\n5️⃣ Testing Sign In with Registered Account...');
    const loginRes = await request(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: testEmail, password: 'SecurePassword123!' }
    );
    console.log(`   Response (${loginRes.statusCode}): ${loginRes.data.message}`);
    if (loginRes.statusCode !== 200 || !loginRes.data.token) {
      throw new Error('Login failed');
    }

    // 6. Employees: GET List
    console.log('\n6️⃣ Testing GET /api/employees (Protected)...');
    const listRes = await request({
      host: 'localhost',
      port: 5000,
      path: '/api/employees',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   Status: ${listRes.statusCode}, Found: ${listRes.data.count} employees`);
    if (listRes.statusCode !== 200) throw new Error('Failed to get employee list');

    // 7. Employees: POST Create
    console.log('\n7️⃣ Testing POST /api/employees (Add Employee)...');
    const newEmp = {
      name: 'Alexander Sterling',
      email: 'alex.sterling@example.com',
      phone: '+1 (555) 789-0123',
      department: 'Engineering',
      salary: 115000.00
    };
    const createRes = await request(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/employees',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      },
      newEmp
    );
    console.log(`   Response (${createRes.statusCode}): ${createRes.data.message}`);
    if (createRes.statusCode !== 201 || !createRes.data.data?.id) {
      throw new Error('Failed to create employee');
    }
    createdEmpId = createRes.data.data.id;
    console.log(`   ✅ Created employee ID: ${createdEmpId}`);

    // 8. Employees: GET by ID
    console.log(`\n8️⃣ Testing GET /api/employees/${createdEmpId}...`);
    const getByIdRes = await request({
      host: 'localhost',
      port: 5000,
      path: `/api/employees/${createdEmpId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   Employee Name: ${getByIdRes.data.data.name}, Salary: $${getByIdRes.data.data.salary}`);
    if (getByIdRes.statusCode !== 200) throw new Error('Failed to fetch employee by ID');

    // 9. Employees: PUT Update
    console.log(`\n9️⃣ Testing PUT /api/employees/${createdEmpId} (Edit Employee)...`);
    const updatedData = {
      name: 'Alexander Sterling (Senior Principal)',
      email: 'alex.sterling@example.com',
      phone: '+1 (555) 789-0123',
      department: 'Engineering',
      salary: 135000.00
    };
    const updateRes = await request(
      {
        host: 'localhost',
        port: 5000,
        path: `/api/employees/${createdEmpId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      },
      updatedData
    );
    console.log(`   Response (${updateRes.statusCode}): ${updateRes.data.message}`);
    if (updateRes.statusCode !== 200 || updateRes.data.data.salary !== 135000) {
      throw new Error('Failed to update employee');
    }

    // 10. Employees: DELETE
    console.log(`\n🔟 Testing DELETE /api/employees/${createdEmpId}...`);
    const deleteRes = await request({
      host: 'localhost',
      port: 5000,
      path: `/api/employees/${createdEmpId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   Response (${deleteRes.statusCode}): ${deleteRes.data.message}`);
    if (deleteRes.statusCode !== 200) throw new Error('Failed to delete employee');

    // 11. Verify Deleted
    console.log(`\n1️⃣1️⃣ Verifying Employee ${createdEmpId} is Deleted...`);
    const verifyDeleted = await request({
      host: 'localhost',
      port: 5000,
      path: `/api/employees/${createdEmpId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   Status after deletion: ${verifyDeleted.statusCode} (Expected 404)`);
    if (verifyDeleted.statusCode !== 404) throw new Error('Employee should not exist after deletion');

    console.log('\n======================================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED PERFECTLY!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test Error:', err.message);
    process.exit(1);
  }
}

// Start backend in background and run tests
import('./src/server.js').then(() => {
  setTimeout(runTests, 1000);
});
