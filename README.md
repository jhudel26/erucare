# ERU Pregnancy Tracker - Vercel Edition

A comprehensive Progressive Web App (PWA) for pregnancy tracking with medicine management and diary functionality, fully migrated for Vercel deployment.

## Features

### 🏥 Medical Interface
- Clean, professional medical UI design
- Modern mobile app-like interface
- Touch-friendly navigation
- Responsive design for all devices

### 👥 User Management
- Secure authentication system
- Role-based access (Admin/User)
- Node.js serverless functions

### 💊 Medicine Management
- Admin can add medicines
- Admin can assign medicines to users
- Users can track medicine intake
- Automatic diary logging for medicine intake
- Quantity tracking

### 📝 Diary System
- Personal diary entries
- Automatic medicine intake logging
- Entry history
- Delete functionality
- Admin can manage all entries

### 📱 PWA Features
- Install to home screen
- Offline functionality
- Fast loading
- Mobile-optimized interface
- Bottom navigation bar

## Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling
- **JavaScript** - Interactive functionality
- **Bootstrap 5** - Responsive framework
- **SweetAlert2** - Beautiful alerts

### Backend (Vercel)
- **Node.js** - Serverless functions
- **@vercel/postgres** - Managed database
- **Vercel Functions** - API endpoints

### PWA
- **Service Worker** - Offline caching
- **Manifest.json** - App installation

## Deployment on Vercel

1. **Push to GitHub**
   Ensure your repository is connected to Vercel.

2. **Database Configuration**
   - Create a **Postgres database** in your Vercel project settings.
   - The environment variables (e.g., `POSTGRES_URL`) will be automatically added to your project.

3. **Run Locally**
   ```bash
   npm install
   npm start
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

## API Endpoints (Vercel Functions)

All endpoints are located in the `/api/` directory as `.js` files.

### Authentication
- `POST /api/login.js` - User login
- `POST /api/logout.js` - User logout

### Admin Only
- `POST /api/add_user.js` - Add new user
- `POST /api/add_medicine.js` - Add medicine
- `POST /api/assign_medicine.js` - Assign medicine to user
- `GET /api/get_admin_stats.js` - Get admin statistics
- `GET /api/get_users.js` - Get all users
- `GET /api/get_medicines.js` - Get all medicines
- `GET /api/get_all_diary.js` - Get all diary entries
- `POST /api/delete_admin_diary.js` - Delete diary entry (admin)

### User Functions
- `GET /api/get_user_medicines.js` - Get user medicines
- `POST /api/take_medicine.js` - Take medicine
- `GET /api/get_logs.js` - Get medicine logs
- `POST /api/add_diary.js` - Add diary entry
- `GET /api/get_diary.js` - Get diary entries
- `POST /api/delete_diary.js` - Delete diary entry (user)

## Project Structure
- `/admin/` - Admin interface HTML files
- `/api/` - Vercel Serverless Functions (Node.js)
- `/public/` - Static assets, manifest, and service worker
- `/user/` - User interface HTML files
- `package.json` - Node.js dependencies and scripts
- `vercel.json` - Vercel configuration and rewrites
