const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from config.env file
dotenv.config({ path: path.join(__dirname, '..', '..', 'config.env') });

// Import models
const User = require('../models/User');
const Table = require('../models/Table');
const TimeSlot = require('../models/TimeSlot');
const Reservation = require('../models/Reservation');
const Review = require('../models/Review');

// Sample data
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@restaurant.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'staff',
    phone: '+1-555-0100',
    isActive: true
  },
  {
    username: 'staff1',
    email: 'staff1@restaurant.com',
    password: 'staff123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'staff',
    phone: '+1-555-0101',
    isActive: true
  },
  {
    username: 'customer1',
    email: 'john.doe@email.com',
    password: 'customer123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'customer',
    phone: '+1-555-0200',
    isActive: true
  },
  {
    username: 'customer2',
    email: 'jane.smith@email.com',
    password: 'customer123',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'customer',
    phone: '+1-555-0201',
    isActive: true
  },
  {
    username: 'customer3',
    email: 'mike.wilson@email.com',
    password: 'customer123',
    firstName: 'Mike',
    lastName: 'Wilson',
    role: 'customer',
    phone: '+1-555-0202',
    isActive: true
  }
];

const sampleTables = [
  {
    tableNumber: 1,
    capacity: 2,
    location: 'indoor',
    area: 'main',
    features: ['window-view', 'quiet-area'],
    pricePerPerson: 25.0,
    isActive: true,
    currentStatus: 'available'
  },
  {
    tableNumber: 2,
    capacity: 4,
    location: 'indoor',
    area: 'main',
    features: ['accessible', 'high-chair-available'],
    pricePerPerson: 25.0,
    isActive: true,
    currentStatus: 'available'
  },
  {
    tableNumber: 3,
    capacity: 6,
    location: 'indoor',
    area: 'main',
    features: ['accessible'],
    pricePerPerson: 25.0,
    isActive: true,
    currentStatus: 'available'
  },
  {
    tableNumber: 4,
    capacity: 2,
    location: 'outdoor',
    area: 'patio',
    features: ['quiet-area'],
    pricePerPerson: 30.0,
    isActive: true,
    currentStatus: 'available'
  },
  {
    tableNumber: 5,
    capacity: 4,
    location: 'outdoor',
    area: 'patio',
    features: ['high-chair-available'],
    pricePerPerson: 30.0,
    isActive: true,
    currentStatus: 'available'
  },
  {
    tableNumber: 6,
    capacity: 8,
    location: 'indoor',
    area: 'private',
    features: ['private', 'accessible'],
    pricePerPerson: 35.0,
    isActive: true,
    currentStatus: 'available'
  },
  {
    tableNumber: 7,
    capacity: 2,
    location: 'bar',
    area: 'bar',
    features: ['accessible'],
    pricePerPerson: 20.0,
    isActive: true,
    currentStatus: 'available'
  },
  {
    tableNumber: 8,
    capacity: 4,
    location: 'outdoor',
    area: 'rooftop',
    features: ['window-view'],
    pricePerPerson: 40.0,
    isActive: true,
    currentStatus: 'available'
  }
];

// Generate time slots for the next 7 days
const generateTimeSlots = () => {
  const timeSlots = [];
  const startDate = new Date();
  
  for (let day = 0; day < 7; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Lunch slots
    const lunchTimes = ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30'];
    lunchTimes.forEach(startTime => {
      const endTime = new Date(`2000-01-01T${startTime}`);
      endTime.setHours(endTime.getHours() + 2);
      const endTimeStr = endTime.toTimeString().slice(0, 5);
      
      timeSlots.push({
        date: new Date(dateStr),
        startTime,
        endTime: endTimeStr,
        duration: 120,
        maxPartySize: 8,
        location: 'indoor',
        area: 'main',
        specialPricing: 25.00,
        specialNotes: day === 0 ? 'Today\'s special: 20% off lunch!' : null,
        isAvailable: true,
        features: ['lunch', 'indoor']
      });
    });
    
    // Dinner slots
    const dinnerTimes = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];
    dinnerTimes.forEach(startTime => {
      const endTime = new Date(`2000-01-01T${startTime}`);
      endTime.setHours(endTime.getHours() + 2);
      const endTimeStr = endTime.toTimeString().slice(0, 5);
      
      timeSlots.push({
        date: new Date(dateStr),
        startTime,
        endTime: endTimeStr,
        duration: 120,
        maxPartySize: 8,
        location: 'indoor',
        area: 'main',
        specialPricing: 35.00,
        specialNotes: day === 6 ? 'Weekend special: Live music!' : null,
        isAvailable: true,
        features: ['dinner', 'indoor']
      });
    });
    
    // Outdoor/Patio slots (weather dependent)
    if (day < 3) { // Only first 3 days for demo
      const outdoorTimes = ['18:00', '18:30', '19:00', '19:30', '20:00'];
      outdoorTimes.forEach(startTime => {
        const endTime = new Date(`2000-01-01T${startTime}`);
        endTime.setHours(endTime.getHours() + 2);
        const endTimeStr = endTime.toTimeString().slice(0, 5);
        
        timeSlots.push({
          date: new Date(dateStr),
          startTime,
          endTime: endTimeStr,
          duration: 120,
          maxPartySize: 6,
          location: 'outdoor',
          area: 'patio',
          specialPricing: 30.00,
          specialNotes: 'Weather permitting - covered patio available',
          isAvailable: true,
          features: ['dinner', 'outdoor', 'patio']
        });
      });
    }
  }
  
  return timeSlots;
};

const sampleTimeSlots = generateTimeSlots();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-reservation');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Hash passwords
const hashPasswords = async (users) => {
  return Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      return { ...user, password: hashedPassword };
    })
  );
};

// Seed the database
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data
    await User.deleteMany({});
    await Table.deleteMany({});
    await TimeSlot.deleteMany({});
    await Reservation.deleteMany({});
    await Review.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create users
    const hashedUsers = await hashPasswords(sampleUsers);
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`Created ${createdUsers.length} users`);
    
    // Create tables
    const createdTables = await Table.insertMany(sampleTables);
    console.log(`Created ${createdTables.length} tables`);
    
    // Create time slots (set createdBy to a staff user)
    const staffUser = createdUsers.find(u => u.role === 'staff') || createdUsers[0];
    const timeSlotsWithCreator = sampleTimeSlots.map(ts => ({ ...ts, createdBy: staffUser._id }));
    const createdTimeSlots = await TimeSlot.insertMany(timeSlotsWithCreator);
    console.log(`Created ${createdTimeSlots.length} time slots`);
    
    // Create sample reservations
    const sampleReservations = [
      {
        customer: createdUsers.find(u => u.username === 'customer1')._id,
        timeSlot: createdTimeSlots[0]._id,
        table: createdTables[0]._id,
        partySize: 2,
        reservationDate: createdTimeSlots[0].date,
        startTime: createdTimeSlots[0].startTime,
        endTime: createdTimeSlots[0].endTime,
        status: 'confirmed',
        specialRequests: 'Window seat preferred',
        customerNotes: 'First time visiting, excited!',
        isWalkIn: false
      },
      {
        customer: createdUsers.find(u => u.username === 'customer2')._id,
        timeSlot: createdTimeSlots[1]._id,
        table: createdTables[1]._id,
        partySize: 4,
        reservationDate: createdTimeSlots[1].date,
        startTime: createdTimeSlots[1].startTime,
        endTime: createdTimeSlots[1].endTime,
        status: 'confirmed',
        specialRequests: 'High chair needed for toddler',
        customerNotes: 'Celebrating anniversary',
        isWalkIn: false
      },
      {
        customer: createdUsers.find(u => u.username === 'customer3')._id,
        timeSlot: createdTimeSlots[2]._id,
        table: createdTables[2]._id,
        partySize: 6,
        reservationDate: createdTimeSlots[2].date,
        startTime: createdTimeSlots[2].startTime,
        endTime: createdTimeSlots[2].endTime,
        status: 'pending',
        specialRequests: 'Birthday celebration',
        customerNotes: 'Will bring birthday cake',
        isWalkIn: false
      }
    ];
    
    const createdReservations = await Reservation.insertMany(sampleReservations);
    console.log(`Created ${createdReservations.length} reservations`);
    
    // Create sample reviews
    const sampleReviews = [
      {
        customer: createdUsers.find(u => u.username === 'customer1')._id,
        reservation: createdReservations[0]._id,
        rating: 5,
        foodRating: 5,
        serviceRating: 5,
        ambianceRating: 4,
        comment: 'Amazing experience! The food was delicious and the service was impeccable. The window seat provided a beautiful view of the city. Highly recommend!',
        images: [],
        isVerified: true,
        isPublic: true,
        helpfulVotes: 3
      },
      {
        customer: createdUsers.find(u => u.username === 'customer2')._id,
        reservation: createdReservations[1]._id,
        rating: 4,
        foodRating: 4,
        serviceRating: 5,
        ambianceRating: 5,
        comment: 'Great place for a romantic dinner. The staff was very accommodating with our toddler. Food was excellent, though a bit pricey. Will definitely return!',
        images: [],
        isVerified: true,
        isPublic: true,
        helpfulVotes: 1
      }
    ];
    
    const createdReviews = await Review.insertMany(sampleReviews);
    console.log(`Created ${createdReviews.length} reviews`);
    
    // Add staff response to one review
    await Review.findByIdAndUpdate(createdReviews[0]._id, {
      staffResponse: {
        comment: 'Thank you for your wonderful review! We\'re so glad you enjoyed your experience. We look forward to serving you again soon!',
        respondedBy: createdUsers.find(u => u.username === 'staff1')._id,
        respondedAt: new Date()
      }
    });
    
    console.log('Database seeding completed successfully!');
    console.log('\nSample accounts created:');
    console.log('Admin: admin@restaurant.com / admin123');
    console.log('Staff: staff1@restaurant.com / staff123');
    console.log('Customer: john.doe@email.com / customer123');
    console.log('Customer: jane.smith@email.com / customer123');
    console.log('Customer: mike.wilson@email.com / customer123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeding
if (require.main === module) {
  connectDB().then(() => {
    seedDatabase();
  });
}

module.exports = { seedDatabase };
