const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const WasteCategory = require('./models/WasteCategory');
const WasteRequest = require('./models/WasteRequest');
const Complaint = require('./models/Complaint');
const RecyclingRecord = require('./models/RecyclingRecord');
const Notification = require('./models/Notification');

dotenv.config();

const categoriesData = [
  {
    name: 'Organic',
    description: 'Food leftovers, fruit peels, vegetable scraps, yard trimmings and garden waste for bio-composting.',
    icon: 'Leaf',
    color: 'emerald',
    isActive: true,
  },
  {
    name: 'Plastic',
    description: 'PET bottles, milk jugs, food containers, hard plastics, LDPE films and poly packaging.',
    icon: 'Package',
    color: 'blue',
    isActive: true,
  },
  {
    name: 'Paper',
    description: 'Cardboard boxes, shipping cartons, newspapers, office stationery, books and magazines.',
    icon: 'FileText',
    color: 'amber',
    isActive: true,
  },
  {
    name: 'Glass',
    description: 'Clear, amber, and green glass bottles, food jars, beverage containers, and clean cullet.',
    icon: 'Wine',
    color: 'cyan',
    isActive: true,
  },
  {
    name: 'Metal',
    description: 'Aluminum beverage cans, tin food cans, metal scrap, aerosol containers and copper cables.',
    icon: 'Hammer',
    color: 'slate',
    isActive: true,
  },
  {
    name: 'E-Waste',
    description: 'Old computers, mobile phones, printed circuit boards, cables, household electronics and lithium batteries.',
    icon: 'Cpu',
    color: 'violet',
    isActive: true,
  },
  {
    name: 'Mixed Waste',
    description: 'Non-hazardous mixed dry recyclables requiring municipal sorting and segregation facility handling.',
    icon: 'Recycle',
    color: 'teal',
    isActive: true,
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_waste_db';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clean existing data
    await User.deleteMany({});
    await WasteCategory.deleteMany({});
    await WasteRequest.deleteMany({});
    await Complaint.deleteMany({});
    await RecyclingRecord.deleteMany({});
    await Notification.deleteMany({});
    console.log('[Seed] Cleared existing collections');

    // 1. Create Users
    const adminUser = await User.create({
      name: 'Chief Waste Administrator',
      email: 'admin@smartwaste.gov',
      phone: '+1 (555) 019-2834',
      password: 'admin123', // Will be hashed by pre-save
      role: 'admin',
      address: 'City Municipal Waste Operations Center, Eco District 1',
      status: 'active',
    });

    const citizen1 = await User.create({
      name: 'Alex Rivera',
      email: 'citizen@gmail.com',
      phone: '+1 (555) 234-5678',
      password: 'citizen123',
      role: 'citizen',
      address: '742 Evergreen Terrace, Springfield',
      status: 'active',
    });

    const citizen2 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.green@gmail.com',
      phone: '+1 (555) 876-5432',
      password: 'citizen123',
      role: 'citizen',
      address: '108 Pinecone Lane, Maplewood Heights',
      status: 'active',
    });

    console.log(`[Seed] Created 1 Admin and 2 Citizens`);

    // 2. Create Categories
    await WasteCategory.insertMany(categoriesData);
    console.log(`[Seed] Inserted ${categoriesData.length} waste categories`);

    // 3. Create Sample Waste Requests
    const now = new Date();
    const subDays = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const addDays = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const requests = [
      {
        requestId: 'REQ-26101-842',
        citizen: citizen1._id,
        wasteType: 'Plastic',
        quantity: '18 kg (3 bags)',
        quantityValue: 18,
        unit: 'kg',
        preferredDate: addDays(2),
        address: '742 Evergreen Terrace, Springfield',
        description: 'Assorted plastic beverage bottles, clean food containers and packaging shrink wrap.',
        status: 'Pending',
        createdAt: subDays(1),
      },
      {
        requestId: 'REQ-26102-391',
        citizen: citizen1._id,
        wasteType: 'Paper',
        quantity: '25 kg (5 cartons)',
        quantityValue: 25,
        unit: 'kg',
        preferredDate: subDays(1),
        scheduledDate: subDays(1),
        address: '742 Evergreen Terrace, Springfield',
        description: 'Bundled cardboard shipping boxes and old newspapers from attic clearance.',
        status: 'Completed',
        adminResponse: 'Collection completed on schedule by Municipal Team Bravo.',
        completedAt: subDays(1),
        createdAt: subDays(5),
      },
      {
        requestId: 'REQ-26103-912',
        citizen: citizen2._id,
        wasteType: 'Organic',
        quantity: '30 kg',
        quantityValue: 30,
        unit: 'kg',
        preferredDate: addDays(3),
        scheduledDate: addDays(3),
        address: '108 Pinecone Lane, Maplewood Heights',
        description: 'Garden prunings, fallen leaves, and organic kitchen composting material in biodegradable sacks.',
        status: 'Scheduled',
        adminResponse: 'Request accepted and scheduled for collection on Friday morning.',
        createdAt: subDays(2),
      },
      {
        requestId: 'REQ-26104-517',
        citizen: citizen2._id,
        wasteType: 'E-Waste',
        quantity: '12 kg',
        quantityValue: 12,
        unit: 'kg',
        preferredDate: addDays(1),
        address: '108 Pinecone Lane, Maplewood Heights',
        description: '2 obsolete desktop monitors, old motherboard, power cords, and rechargeable batteries.',
        status: 'Accepted',
        adminResponse: 'Accepted for specialized electronics recycling facility drop.',
        createdAt: subDays(3),
      },
      {
        requestId: 'REQ-26105-204',
        citizen: citizen1._id,
        wasteType: 'Glass',
        quantity: '15 kg',
        quantityValue: 15,
        unit: 'kg',
        preferredDate: subDays(3),
        scheduledDate: subDays(3),
        address: '742 Evergreen Terrace, Springfield',
        description: 'Assorted glass jars and beverage bottles, thoroughly rinsed and sorted by color.',
        status: 'Collected',
        adminResponse: 'Collected by truck #4 and transferred to municipal sorting center.',
        createdAt: subDays(6),
      },
      {
        requestId: 'REQ-26106-673',
        citizen: citizen2._id,
        wasteType: 'Metal',
        quantity: '40 kg',
        quantityValue: 40,
        unit: 'kg',
        preferredDate: subDays(10),
        address: '108 Pinecone Lane, Maplewood Heights',
        description: 'Construction scrap, aluminum gutters and corrugated sheet offcuts.',
        status: 'Completed',
        adminResponse: 'Verified and delivered to City Smelting & Metal Recovery plant.',
        completedAt: subDays(8),
        createdAt: subDays(12),
      },
      {
        requestId: 'REQ-26107-119',
        citizen: citizen1._id,
        wasteType: 'Mixed Waste',
        quantity: '50 kg',
        quantityValue: 50,
        unit: 'kg',
        preferredDate: subDays(4),
        address: '742 Evergreen Terrace, Springfield',
        description: 'Household renovation drywall scraps and hazardous solvent cans.',
        status: 'Rejected',
        rejectionReason: 'Hazardous chemicals and construction drywall must be scheduled via Special Industrial Disposal permit.',
        adminResponse: 'Rejected: Hazardous chemicals cannot be collected via residential recycling stream.',
        createdAt: subDays(7),
      },
    ];

    const createdRequests = await WasteRequest.insertMany(requests);
    console.log(`[Seed] Created ${createdRequests.length} sample waste collection requests`);

    // 4. Create Sample Complaints
    const complaints = [
      {
        complaintId: 'CMP-26101-441',
        citizen: citizen1._id,
        category: 'Missed Collection',
        description: 'Regular Tuesday morning curbside pickup skipped our entire odd-numbered lane.',
        address: '742 Evergreen Terrace, Springfield',
        status: 'In Progress',
        adminResponse: 'Supervisor dispatched backup route driver to service missed block today.',
        createdAt: subDays(2),
      },
      {
        complaintId: 'CMP-26102-882',
        citizen: citizen2._id,
        category: 'Waste Overflow',
        description: 'Community recycling bin at Maplewood Park corner is overflowing onto the sidewalk.',
        address: 'Corner of Maplewood Heights & 5th Ave',
        status: 'Resolved',
        adminResponse: 'Bin emptied and an additional 240L high-capacity bin installed on site.',
        createdAt: subDays(4),
      },
      {
        complaintId: 'CMP-26103-125',
        citizen: citizen1._id,
        category: 'Damaged Bin',
        description: 'Green organics bin lid hinge broken during yesterday municipal truck hydraulic lifting.',
        address: '742 Evergreen Terrace, Springfield',
        status: 'Pending',
        createdAt: subDays(1),
      },
    ];

    const createdComplaints = await Complaint.insertMany(complaints);
    console.log(`[Seed] Created ${createdComplaints.length} sample complaints`);

    // 5. Create Recycling Records
    const recyclingRecords = [
      {
        recordId: 'REC-26101-710',
        wasteType: 'Plastic',
        quantity: 240,
        unit: 'kg',
        method: 'Mechanical Shredding & Pelletizing',
        status: 'Recycled',
        notes: 'Reprocessed into rPET high-grade resin pellets for sustainable manufacturing.',
        date: subDays(1),
      },
      {
        recordId: 'REC-26102-334',
        wasteType: 'Paper',
        quantity: 580,
        unit: 'kg',
        method: 'Hydropulping & De-inking',
        status: 'Recycled',
        notes: 'Converted into recycled craft paper packaging and cardboard liners.',
        date: subDays(2),
      },
      {
        recordId: 'REC-26103-992',
        wasteType: 'Organic',
        quantity: 750,
        unit: 'kg',
        method: 'Aerobic High-Temperature Composting',
        status: 'Processing',
        notes: 'Compost pile stage 2 aeration at municipal bio-facility.',
        date: subDays(3),
      },
      {
        recordId: 'REC-26104-411',
        wasteType: 'Metal',
        quantity: 320,
        unit: 'kg',
        method: 'Magnetic Separation & Smelting',
        status: 'Recycled',
        notes: 'Extracted aluminum ingot bars with 98.4% recovery efficiency.',
        date: subDays(5),
      },
      {
        recordId: 'REC-26105-885',
        wasteType: 'E-Waste',
        quantity: 110,
        unit: 'kg',
        method: 'Dismantling & Precious Metal Hydrometallurgy',
        status: 'Received',
        notes: 'Secured in climate controlled staging room for certified dismantling.',
        date: subDays(6),
      },
      {
        recordId: 'REC-26106-209',
        wasteType: 'Glass',
        quantity: 420,
        unit: 'kg',
        method: 'Cullet Crushing & Remelt',
        status: 'Recycled',
        notes: 'Furnace blend for local glass bottle manufacturing.',
        date: subDays(8),
      },
    ];

    await RecyclingRecord.insertMany(recyclingRecords);
    console.log(`[Seed] Created ${recyclingRecords.length} recycling records`);

    // 6. Create Notifications
    const notifications = [
      {
        recipient: adminUser._id,
        title: 'New Waste Collection Request',
        message: 'Citizen Alex Rivera submitted a new request for Plastic (18 kg). [REQ-26101-842]',
        type: 'request',
        relatedRequest: createdRequests[0]._id,
        isRead: false,
        createdAt: subDays(1),
      },
      {
        recipient: adminUser._id,
        title: 'New Citizen Complaint Submitted',
        message: 'Citizen Alex Rivera reported "Damaged Bin" at 742 Evergreen Terrace. [CMP-26103-125]',
        type: 'complaint',
        relatedComplaint: createdComplaints[2]._id,
        isRead: false,
        createdAt: subDays(1),
      },
      {
        recipient: citizen1._id,
        title: 'Waste Request Accepted',
        message: 'Your waste collection request REQ-26102-391 has been accepted by the municipal team.',
        type: 'request',
        relatedRequest: createdRequests[1]._id,
        isRead: true,
        createdAt: subDays(4),
      },
      {
        recipient: citizen2._id,
        title: 'Collection Scheduled',
        message: 'Waste collection for REQ-26103-912 has been scheduled for Friday morning.',
        type: 'request',
        relatedRequest: createdRequests[2]._id,
        isRead: false,
        createdAt: subDays(2),
      },
    ];

    await Notification.insertMany(notifications);
    console.log(`[Seed] Created ${notifications.length} notifications`);

    console.log('==================================================');
    console.log('DATABASE SEED COMPLETED SUCCESSFULLY!');
    console.log('Admin Credentials:   admin@smartwaste.gov / admin123');
    console.log('Citizen Credentials: citizen@gmail.com    / citizen123');
    console.log('Citizen 2:           sarah.green@gmail.com / citizen123');
    console.log('==================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
