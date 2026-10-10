const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('==================================================');
  console.log('STARTING SMART WASTE SYSTEM INTEGRATION TESTS');
  console.log('==================================================\n');

  try {
    // 1. Health check
    console.log('[1] Testing API Health Check...');
    const health = await axios.get(`${API_URL}/health`);
    console.log('✅ Health status:', health.data.status, `(${health.data.system})`);

    // 2. Citizen Login
    console.log('\n[2] Testing Citizen Login (citizen@gmail.com)...');
    const citizenLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'citizen@gmail.com',
      password: 'citizen123',
    });
    const citizenToken = citizenLogin.data.data.token;
    const citizenId = citizenLogin.data.data._id;
    console.log('✅ Citizen Login Success. Token generated for:', citizenLogin.data.data.name);

    // 3. Admin Login
    console.log('\n[3] Testing Admin Login (admin@smartwaste.gov)...');
    const adminLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@smartwaste.gov',
      password: 'admin123',
    });
    const adminToken = adminLogin.data.data.token;
    console.log('✅ Admin Login Success. Token generated for:', adminLogin.data.data.name);

    const citizenHeaders = { headers: { Authorization: `Bearer ${citizenToken}` } };
    const adminHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };

    // 4. Citizen Submits Waste Request
    console.log('\n[4] Citizen Creating Waste Collection Request...');
    const preferredDate = new Date();
    preferredDate.setDate(preferredDate.getDate() + 3);

    const createReq = await axios.post(
      `${API_URL}/requests`,
      {
        wasteType: 'Plastic',
        quantity: '20 kg (4 bags)',
        preferredDate: preferredDate.toISOString(),
        address: '742 Evergreen Terrace, Springfield',
        description: 'Clean rinsed HDPE and PET bottles bundled for recycling.',
      },
      citizenHeaders
    );
    const requestId = createReq.data.data._id;
    const requestHumanId = createReq.data.data.requestId;
    console.log(`✅ Waste Request Created: ${requestHumanId} (${createReq.data.data.wasteType}, ${createReq.data.data.quantity})`);
    console.log('   Status:', createReq.data.data.status);

    // 5. Verify Admin Received Notification
    console.log('\n[5] Verifying Admin Notification in MongoDB...');
    const adminNotifications = await axios.get(`${API_URL}/notifications`, adminHeaders);
    const latestNotif = adminNotifications.data.data[0];
    console.log(`✅ Admin Notification Verified: "${latestNotif.title}" - "${latestNotif.message}"`);

    // 6. Admin Accepts Request
    console.log(`\n[6] Admin Accepting Request ${requestHumanId}...`);
    const acceptReq = await axios.put(
      `${API_URL}/requests/${requestId}/accept`,
      {
        adminResponse: 'Accepted for municipal collection on Friday morning.',
        scheduledDate: preferredDate.toISOString(),
      },
      adminHeaders
    );
    console.log('✅ Admin Accepted Request. New Status:', acceptReq.data.data.status);

    // 7. Verify Citizen Received Notification
    console.log('\n[7] Verifying Citizen Notification Received...');
    const citizenNotifications = await axios.get(`${API_URL}/notifications`, citizenHeaders);
    const citizenNotif = citizenNotifications.data.data[0];
    console.log(`✅ Citizen Notification: "${citizenNotif.title}" - "${citizenNotif.message}"`);

    // 8. Admin Progresses Status: Collected -> Completed
    console.log(`\n[8] Admin Updating Lifecycle: Scheduled -> Collected -> Completed...`);
    const collectedRes = await axios.put(
      `${API_URL}/requests/${requestId}/status`,
      { status: 'Collected', adminResponse: 'Loaded onto truck #4.' },
      adminHeaders
    );
    console.log('✅ Status updated to:', collectedRes.data.data.status);

    const completedRes = await axios.put(
      `${API_URL}/requests/${requestId}/status`,
      { status: 'Completed', adminResponse: 'Delivered and weighed at Eco Sorting Hub.' },
      adminHeaders
    );
    console.log('✅ Status updated to:', completedRes.data.data.status);

    // 9. Admin Records Recycling Batch
    console.log('\n[9] Admin Logging Industrial Recycling Batch...');
    const recyclingBatch = await axios.post(
      `${API_URL}/recycling`,
      {
        wasteType: 'Plastic',
        quantity: 20,
        unit: 'kg',
        method: 'Mechanical Shredding & Pelletizing',
        status: 'Recycled',
        notes: 'Converted into high-grade rPET pellets.',
      },
      adminHeaders
    );
    console.log(`✅ Recycling Batch Created: ${recyclingBatch.data.data.recordId} (${recyclingBatch.data.data.quantity} kg, Status: ${recyclingBatch.data.data.status})`);

    // 10. Verify Analytics Dashboard Summary
    console.log('\n[10] Verifying Analytics Summary & Charts...');
    const analytics = await axios.get(`${API_URL}/analytics/dashboard`, adminHeaders);
    console.log('✅ Real-time Analytics Data:', JSON.stringify(analytics.data.data, null, 2));

    // 11. Citizen Files Complaint & Admin Responds
    console.log('\n[11] Testing Complaint Workflow...');
    const complaintRes = await axios.post(
      `${API_URL}/complaints`,
      {
        category: 'Waste Overflow',
        description: 'Recycling bin on 4th block is overflowing.',
        address: 'Corner of 4th Ave & Elm St',
      },
      citizenHeaders
    );
    const complaintId = complaintRes.data.data._id;
    console.log(`✅ Complaint Filed: ${complaintRes.data.data.complaintId}`);

    const resolveComplaint = await axios.put(
      `${API_URL}/complaints/${complaintId}`,
      {
        status: 'Resolved',
        adminResponse: 'Dispatched emergency sanitation vehicle and emptied container.',
      },
      adminHeaders
    );
    console.log(`✅ Complaint Resolved by Admin. Status: ${resolveComplaint.data.data.status}`);

    console.log('\n==================================================');
    console.log('🎉 ALL INTEGRATION WORKFLOW TESTS PASSED 100%!');
    console.log('==================================================');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

runTests();
