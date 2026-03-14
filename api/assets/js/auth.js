// Authentication helper functions for ERU Pregnancy Tracker

class AuthHelper {
    static async login(username, password) {
        try {
            const response = await fetch('/api/login.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Store user info in sessionStorage for client-side access
                sessionStorage.setItem('userName', result.user.name);
                sessionStorage.setItem('userUsername', result.user.username);
                sessionStorage.setItem('userRole', result.user.role);
                sessionStorage.setItem('userId', result.user.id);
                sessionStorage.setItem('lastLogin', new Date().toISOString());
                
                return result;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    
    static async logout() {
        try {
            await fetch('/api/logout.js', { method: 'POST' });
            sessionStorage.clear();
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            sessionStorage.clear();
            return true;
        }
    }
    
    static isLoggedIn() {
        return sessionStorage.getItem('userId') !== null;
    }
    
    static getUserInfo() {
        return {
            name: sessionStorage.getItem('userName'),
            username: sessionStorage.getItem('userUsername'),
            role: sessionStorage.getItem('userRole'),
            id: sessionStorage.getItem('userId')
        };
    }
    
    static requiresAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    }
    
    static requiresRole(requiredRole) {
        if (!this.requiresAuth()) return false;
        
        const userRole = sessionStorage.getItem('userRole');
        if (userRole !== requiredRole) {
            window.location.href = requiredRole === 'admin' ? '/user/dashboard.html' : '/admin/dashboard.html';
            return false;
        }
        return true;
    }
}

// Auto-redirect based on authentication status
document.addEventListener('DOMContentLoaded', function() {
    // Check if current page requires authentication
    const path = window.location.pathname;
    
    // Pages that don't require authentication
    const publicPages = ['/login.html', '/', '/index.html'];
    const isPublicPage = publicPages.includes(path) || path.endsWith('/login.html') || path.endsWith('/index.html');
    
    if (!isPublicPage && !AuthHelper.isLoggedIn()) {
        window.location.href = '/login.html';
        return;
    }
    
    // Check role-based access
    if (path.includes('/admin/') && !AuthHelper.requiresRole('admin')) {
        return;
    }
    
    if (path.includes('/user/') && !AuthHelper.requiresRole('user')) {
        return;
    }
    
    // Redirect logged-in users away from login page
    if (isPublicPage && AuthHelper.isLoggedIn()) {
        const userRole = sessionStorage.getItem('userRole');
        window.location.href = userRole === 'admin' ? '/admin/dashboard.html' : '/user/dashboard.html';
    }
});
