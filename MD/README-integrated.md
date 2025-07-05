# EGX Pilot Advisor - Portfolio Management Platform

A comprehensive portfolio management platform for the Egyptian Exchange (EGX) with React frontend and Node.js backend.

## 🌟 Features

### 📊 Portfolio Management
- **Multi-Portfolio Support**: Create and manage multiple portfolios (paper trading & real trading)
- **Position Tracking**: Track stock positions with real-time P&L calculations
- **Transaction History**: Detailed transaction logs with filtering and pagination
- **Performance Analytics**: Comprehensive performance reports and metrics
- **Risk Analysis**: Portfolio risk metrics and asset allocation insights

### 🔐 Authentication & Security
- **Google OAuth Integration**: Secure login with Google accounts
- **JWT Authentication**: Token-based authentication with refresh tokens
- **Test User Support**: Development mode test user creation
- **Session Management**: Secure session handling with auto-refresh

### 📈 Market Data
- **Real-time Quotes**: Live stock price updates
- **Market Overview**: Market indices and top movers
- **Technical Analysis**: Chart integration with technical indicators
- **News Integration**: Market news and analysis

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dark/Light Mode**: Theme switching support
- **Interactive Charts**: Advanced charting with Chart.js
- **Component Library**: shadcn/ui components for consistent design
- **RTL Support**: Right-to-left text support for Arabic content

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TanStack Query** for server state management
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Context** for global state management

### Backend Stack
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** with SQL Server
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Rate limiting** and security middleware

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- SQL Server database
- Bun or npm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd egx-pilot-advisor
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   bun install

   # Backend dependencies
   cd backend
   npm install
   ```

3. **Environment Setup**

   **Frontend (.env)**
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_NODE_ENV=development
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   ```

   **Backend (.env)**
   ```env
   DATABASE_URL="sqlserver://localhost:1433;database=egx_pilot_advisor;user=sa;password=your-password;trustServerCertificate=true"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key"
   NODE_ENV=development
   PORT=3001
   ```

4. **Database Setup**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Application**

   **Terminal 1 - Backend**
   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 - Frontend**
   ```bash
   bun run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:8081
   - Backend API: http://localhost:3001/api

## 🧪 Testing

### Integration Test
Run the comprehensive integration test to verify all systems are working:

```bash
node test-integration.js
```

This test verifies:
- Backend API health
- User authentication
- Portfolio management
- Frontend accessibility

### Manual Testing Workflow

1. **Login**
   - Open http://localhost:8081
   - Use "Test User Login" with test@example.com
   - Should redirect to main dashboard

2. **Portfolio Management**
   - View default portfolio or create new one
   - Add stock positions (buy/sell)
   - View transaction history
   - Check performance metrics

3. **API Testing**
   ```bash
   # Test authentication
   curl -X POST http://localhost:3001/api/auth/test-user \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "name": "Test User"}'

   # Test portfolios (use token from auth response)
   curl -H "Authorization: Bearer <token>" \
     http://localhost:3001/api/portfolio
   ```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/test-user` - Create test user (development)
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - Logout user

### Portfolio Endpoints
- `GET /api/portfolio` - Get all portfolios
- `POST /api/portfolio` - Create portfolio
- `GET /api/portfolio/:id` - Get portfolio details
- `PUT /api/portfolio/:id` - Update portfolio
- `DELETE /api/portfolio/:id` - Delete portfolio

### Position Management
- `POST /api/portfolio/:id/positions` - Add position (buy/sell)
- `DELETE /api/portfolio/:id/positions/:positionId` - Delete position
- `GET /api/portfolio/:id/transactions` - Get transaction history
- `GET /api/portfolio/:id/performance` - Get performance report
- `POST /api/portfolio/:id/sync` - Sync portfolio prices

## 🔧 Development

### Project Structure
```
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── lib/               # Utility functions
├── backend/               # Backend source code
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── prisma/            # Database schema
└── public/                # Static assets
```

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Prisma for database type safety

## 🌍 Deployment

### Frontend Deployment
```bash
bun run build
# Deploy dist/ folder to your hosting service
```

### Backend Deployment
```bash
cd backend
npm run build
# Deploy to your Node.js hosting service
```

### Environment Variables
Make sure to set all production environment variables:
- Database connection strings
- JWT secrets
- Google OAuth credentials
- API URLs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Run the integration test for debugging

---

**Built with ❤️ for the Egyptian financial market**
