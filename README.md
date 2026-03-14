# ERU Pregnancy Tracker

A comprehensive Progressive Web App (PWA) for pregnancy tracking with medicine management and diary functionality.

## Features

### 🏥 Medical Interface
- Clean, professional medical UI design
- Modern mobile app-like interface
- Touch-friendly navigation
- Responsive design for all devices

### 👥 User Management
- Secure authentication system
- Role-based access (Admin/User)
- Session management
- Password security

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
- **CSS3** - Modern styling with animations
- **JavaScript** - Interactive functionality
- **Bootstrap 5** - Responsive framework
- **Bootstrap Icons** - Icon library
- **SweetAlert2** - Beautiful alerts

### Backend
- **PHP** - Server-side logic
- **MySQL** - Database management
- **PDO** - Secure database connections
- **Sessions** - Authentication management

### PWA
- **Service Worker** - Offline caching
- **Manifest.json** - App installation
- **Responsive Design** - Mobile-first approach

## Database Schema

The application uses the following existing tables:

- `users` - User accounts and roles
- `medicines` - Available medicines
- `user_medicines` - Medicine assignments
- `medicine_logs` - Medicine intake history
- `diary_entries` - User diary entries
- `auth_tokens` - Authentication tokens

## Installation

### Prerequisites
- PHP 7.4 or higher
- MySQL database
- Web server (Apache/Nginx)

### Setup

1. **Clone/Deploy the application**
   ```bash
   # Copy files to your web server directory
   # Ensure the directory structure is maintained
   ```

2. **Database Configuration**
   - Update database credentials in `/api/db.php`
   - Ensure the database exists with the required tables

3. **Web Server Configuration**
   - Point your web server to the `/public` directory
   - Ensure rewrite rules are enabled for clean URLs

### Database Connection

Update the database credentials in `/api/db.php`:

```php
private $host = "your-hostname";
private $db_name = "erucare_tracker";
private $username = "your-username";
private $password = "your-password";
```

## Usage

### Admin Access
1. Login with admin credentials
2. Access dashboard to view statistics
3. Add users via "Add User" page
4. Add medicines via "Medicine" page
5. Assign medicines to users via "Assign" page
6. Manage diary entries via "Diary" page

### User Access
1. Login with user credentials
2. View assigned medicines on dashboard
3. Take medicines via "Medicine" page
4. Add diary entries via "Diary" page
5. View profile information

## Security Features

- **Password Hashing** - Secure password storage
- **Session Management** - Secure authentication
- **Role-Based Access** - Admin/user separation
- **Prepared Statements** - SQL injection prevention
- **Input Validation** - Data sanitization

## PWA Installation

1. Open the app in a supported browser
2. Look for the "Install" icon in the address bar
3. Click to install to your device
4. Use like a native mobile app

## File Structure

```
erucare/
├── public/                 # Public-facing files
│   ├── index.html         # Landing page
│   ├── login.html         # Login page
│   ├── manifest.json      # PWA manifest
│   └── service-worker.js # Service worker
├── admin/                 # Admin pages
│   ├── dashboard.html     # Admin dashboard
│   ├── add-user.html      # Add user page
│   ├── add-medicine.html  # Add medicine page
│   ├── assign-medicine.html # Assign medicine page
│   └── manage-diary.html  # Manage diary page
├── user/                  # User pages
│   ├── dashboard.html     # User dashboard
│   ├── medicine.html      # Medicine page
│   ├── diary.html         # Diary page
│   └── profile.html       # Profile page
├── api/                   # Backend API
│   ├── db.php            # Database connection
│   ├── login.php         # Login endpoint
│   ├── logout.php        # Logout endpoint
│   ├── add_user.php      # Add user endpoint
│   ├── add_medicine.php  # Add medicine endpoint
│   ├── assign_medicine.php # Assign medicine endpoint
│   ├── get_user_medicines.php # Get user medicines
│   ├── take_medicine.php # Take medicine endpoint
│   ├── get_logs.php      # Get medicine logs
│   ├── add_diary.php     # Add diary entry
│   ├── get_diary.php     # Get diary entries
│   ├── delete_diary.php  # Delete diary entry
│   ├── get_admin_stats.php # Admin statistics
│   ├── get_users.php     # Get all users
│   ├── get_medicines.php # Get all medicines
│   ├── get_all_diary.php # Get all diary entries
│   ├── delete_admin_diary.php # Admin delete diary
│   └── assets/           # Static assets
│       ├── css/          # Stylesheets
│       │   └── style.css # Main stylesheet
│       ├── js/           # JavaScript files
│       │   └── auth.js   # Authentication helpers
│       └── icons/        # PWA icons
└── README.md             # This file
```

## Deployment

### Vercel Deployment

1. **Prepare for Vercel**
   - Install Vercel CLI: `npm i -g vercel`
   - Configure `vercel.json` for PHP support

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Environment Variables**
   - Set database credentials in Vercel dashboard
   - Configure domain settings

## API Endpoints

### Authentication
- `POST /api/login.php` - User login
- `POST /api/logout.php` - User logout

### Admin Functions
- `POST /api/add_user.php` - Add new user
- `POST /api/add_medicine.php` - Add medicine
- `POST /api/assign_medicine.php` - Assign medicine to user
- `GET /api/get_admin_stats.php` - Get admin statistics
- `GET /api/get_users.php` - Get all users
- `GET /api/get_medicines.php` - Get all medicines
- `GET /api/get_all_diary.php` - Get all diary entries
- `POST /api/delete_admin_diary.php` - Delete diary entry (admin)

### User Functions
- `GET /api/get_user_medicines.php` - Get user medicines
- `POST /api/take_medicine.php` - Take medicine
- `GET /api/get_logs.php` - Get medicine logs
- `POST /api/add_diary.php` - Add diary entry
- `GET /api/get_diary.php` - Get diary entries
- `POST /api/delete_diary.php` - Delete diary entry (user)

## Browser Support

- Chrome (Recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Follow the existing code style
2. Test all functionality
3. Update documentation
4. Ensure mobile responsiveness

## License

This project is proprietary and confidential.

## Support

For support and issues, please contact your system administrator or healthcare provider.
