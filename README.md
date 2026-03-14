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

## API Endpoints (Vercel Functions - Consolidated for Hobby Plan)

The API is consolidated into 3 main functions to comply with Vercel's Hobby plan limits (max 12 functions). All legacy endpoints are automatically rewritten to these handlers via `vercel.json`.

### 🔐 Authentication (`/api/auth.js`)
- `POST /api/login.js` (Legacy) -> `action=login`
- `POST /api/logout.js` (Legacy) -> `action=logout`

### 🛡️ Admin Operations (`/api/admin.js`)
- `GET /api/get_admin_stats.js` -> `action=get_stats`
- `GET /api/get_users.js` -> `action=get_users`
- `POST /api/add_user.js` -> `action=add_user`
- `GET /api/get_medicines.js` -> `action=get_medicines`
- `POST /api/add_medicine.js` -> `action=add_medicine`
- `POST /api/assign_medicine.js` -> `action=assign_medicine`
- `GET /api/get_all_diary.js` -> `action=get_all_diary`
- `POST /api/delete_admin_diary.js` -> `action=delete_diary`

### 👤 User Operations (`/api/user.js`)
- `GET /api/get_diary.js` -> `action=get_diary`
- `POST /api/add_diary.js` -> `action=add_diary`
- `POST /api/delete_diary.js` -> `action=delete_diary`
- `GET /api/get_user_medicines.js` -> `action=get_medicines`
- `POST /api/take_medicine.js` -> `action=take_medicine`
- `GET /api/get_logs.js` -> `action=get_logs`

## Project Structure
- `/admin/` - Admin interface HTML files
- `/api/` - Consolidated Vercel Serverless Functions (Node.js)
- `/public/` - Static assets, manifest, and service worker
- `/user/` - User interface HTML files
- `package.json` - Node.js dependencies and scripts
- `vercel.json` - Vercel configuration, rewrites, and caching headers
