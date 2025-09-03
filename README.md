# Restaurant Reservation Management System

A full-stack web application for managing restaurant reservations with real-time updates, role-based access control, and a comprehensive review system.

## 🚀 Features

### Core Features
- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Customer & Staff)
  - Secure password handling with bcrypt

- **Customer Features**
  - Browse available time slots with filtering
  - Make table reservations
  - View reservation history
  - Cancel/modify reservations
  - Submit reviews and ratings

- **Staff Features**
  - Manage restaurant tables
  - Create and manage time slots
  - Handle reservations and walk-ins
  - View customer information
  - Manage reviews and respond to feedback

- **Real-time Updates**
  - Socket.IO integration for live updates
  - Instant reservation confirmations
  - Real-time availability updates

### Advanced Features
- **Search & Filtering**
  - Date and time-based filtering
  - Party size requirements
  - Location preferences (indoor, outdoor, etc.)
  - Price range filtering
  - Special requirements

- **Review System**
  - 5-star rating system
  - Detailed reviews (food, service, ambiance)
  - Photo uploads (optional)
  - Staff responses
  - Review verification

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time client
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications

### Development Tools
- **Nodemon** - Auto-restart server
- **Concurrently** - Run multiple commands
- **ESLint** - Code linting

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd restaurant-reservation-system
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Setup
The project includes a `config.env` file with default values. You can modify it if needed:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/restaurant-reservation

# JWT Configuration
JWT_SECRET=restaurant-reservation-secret-key-2024

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### 5. Seed the Database (Recommended for Demo)
```bash
npm run seed
```

This will create sample data including:
- **Admin Account**: admin@restaurant.com / admin123
- **Staff Account**: staff1@restaurant.com / staff123  
- **Customer Accounts**: 
  - john.doe@email.com / customer123
  - jane.smith@email.com / customer123
  - mike.wilson@email.com / customer123

### 6. Run the Application
```bash
# Start both backend and frontend
npm start

# Or run them separately:
npm run server    # Backend only
npm run client    # Frontend only
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🗄️ Database Schema

### Users
- Authentication details (username, email, password)
- Personal information (firstName, lastName, phone)
- Role-based access (customer/staff)
- Account status and timestamps

### Tables
- Table configuration (number, capacity, location)
- Features and amenities
- Pricing information
- Current status and availability

### Time Slots
- Available booking periods
- Date, time, and duration
- Maximum party size
- Location and special pricing
- Staff notes and availability

### Reservations
- Customer booking details
- Table and time slot assignments
- Party size and special requests
- Status tracking (pending, confirmed, seated, etc.)
- Timestamps and modifications

### Reviews
- Customer ratings and feedback
- Detailed category ratings (food, service, ambiance)
- Photo uploads and captions
- Staff responses and verification
- Helpful votes and engagement

## 🔐 Authentication & Authorization

### JWT Implementation
- Secure token-based authentication
- 24-hour token expiration
- Automatic token refresh handling
- Secure password storage with bcrypt

### Role-Based Access Control
- **Customer Role**
  - View available time slots
  - Make and manage reservations
  - Submit reviews
  - Access personal dashboard

- **Staff Role**
  - Manage restaurant operations
  - Create and modify time slots
  - Handle reservations and walk-ins
  - Respond to customer feedback
  - Access staff dashboard

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout

### Time Slots
- `GET /api/timeslots` - Get available slots with filtering
- `POST /api/timeslots` - Create new slot (staff only)
- `PUT /api/timeslots/:id` - Update slot (staff only)
- `DELETE /api/timeslots/:id` - Delete slot (staff only)

### Reservations
- `GET /api/reservations` - Get reservations with filtering
- `POST /api/reservations` - Create new reservation
- `PUT /api/reservations/:id` - Update reservation
- `DELETE /api/reservations/:id` - Cancel/delete reservation

### Tables
- `GET /api/tables` - Get tables with filtering
- `POST /api/tables` - Create new table (staff only)
- `PUT /api/tables/:id` - Update table (staff only)
- `DELETE /api/tables/:id` - Delete table (staff only)

### Reviews
- `GET /api/reviews` - Get reviews with filtering
- `POST /api/reviews` - Create new review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete/hide review
- `POST /api/reviews/:id/verify` - Verify review (staff only)

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/profile/password` - Change password
- `GET /api/users` - Get all users (staff only)
- `PUT /api/users/:id` - Update user (staff only)
- `DELETE /api/users/:id` - Deactivate user (staff only)

## 🔄 Real-time Features

### Socket.IO Events
- **Reservation Updates**
  - `reservation-created` - New reservation made
  - `reservation-updated` - Reservation modified
  - `reservation-cancelled` - Reservation cancelled
  - `reservation-deleted` - Reservation removed

- **Time Slot Updates**
  - `timeslot-created` - New slot available
  - `timeslot-updated` - Slot modified
  - `timeslot-deleted` - Slot removed

### Real-time Benefits
- Instant availability updates
- Live reservation confirmations
- Real-time staff notifications
- Enhanced user experience

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Touch-friendly interactions
- Cross-browser compatibility

### Modern Interface
- Clean, intuitive design
- Consistent color scheme
- Smooth animations and transitions
- Accessible components

### User Experience
- Streamlined booking process
- Clear navigation structure
- Helpful error messages
- Loading states and feedback

## 🧪 Testing

### Backend Testing
```bash
# Run backend tests
npm test

# Run with coverage
npm run test:coverage
```

### Frontend Testing
```bash
cd frontend
npm test

# Run with coverage
npm run test:coverage
```

## 📦 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Set environment variables
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
```

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up --build

# Or build individual images
docker build -t restaurant-backend ./backend
docker build -t restaurant-frontend ./frontend
```

## 🔧 Configuration

### Environment Variables
- **PORT** - Server port (default: 5000)
- **NODE_ENV** - Environment mode (development/production)
- **MONGODB_URI** - MongoDB connection string
- **JWT_SECRET** - Secret key for JWT tokens
- **CLIENT_URL** - Frontend URL for CORS

### Database Configuration
- MongoDB connection with Mongoose
- Automatic connection retry
- Connection pooling
- Index optimization for queries

## 📊 Performance Optimizations

### Backend
- Database indexing on frequently queried fields
- Efficient aggregation pipelines
- Connection pooling
- Request validation and sanitization

### Frontend
- React optimization with useMemo and useCallback
- Lazy loading for routes
- Efficient state management
- Optimized bundle size

## 🛡️ Security Features

### Authentication Security
- JWT token validation
- Password hashing with bcrypt
- Secure session management
- Role-based access control

### API Security
- Input validation and sanitization
- CORS configuration
- Rate limiting (can be added)
- SQL injection prevention

### Data Protection
- Secure password storage
- Encrypted communication
- User data isolation
- Audit logging

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- Follow ESLint configuration
- Use consistent formatting
- Add meaningful comments
- Write descriptive commit messages

## 📝 Assumptions & Notes

### Development Assumptions
1. **Single Restaurant**: The system is designed for a single restaurant location
2. **Table Management**: Tables are pre-configured and managed by staff
3. **Time Slots**: Staff creates available time slots for customer booking
4. **Reservation Conflicts**: System prevents double-booking of tables
5. **Real-time Updates**: Socket.IO provides live updates for better UX

### Technical Assumptions
1. **MongoDB**: NoSQL database for flexible schema management
2. **JWT Authentication**: Stateless authentication for scalability
3. **Role-based Access**: Clear separation between customer and staff functions
4. **Responsive Design**: Mobile-first approach for accessibility
5. **Real-time Features**: WebSocket integration for live updates

### Business Logic Assumptions
1. **Reservation Duration**: Standard 2-hour dining slots
2. **Party Size Limits**: Maximum 20 people per reservation
3. **Advance Booking**: Customers can book up to 30 days in advance
4. **Cancellation Policy**: Customers can cancel up to 2 hours before
5. **Review System**: Reviews require completed reservations

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongo --eval "db.adminCommand('ping')"

# Restart MongoDB service
sudo systemctl restart mongod
```

#### Port Conflicts
```bash
# Check if ports are in use
netstat -tulpn | grep :5000
netstat -tulpn | grep :3000

# Kill processes using ports
kill -9 <PID>
```

#### Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run server

# Check environment variables
echo $NODE_ENV
echo $MONGODB_URI
```

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation
- Contact the development team

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS approach
- MongoDB team for the flexible database
- Express.js community for the robust web framework
- All contributors and testers

---

**Note**: This is a demo application built for interview purposes. In production, additional security measures, error handling, and testing should be implemented.
