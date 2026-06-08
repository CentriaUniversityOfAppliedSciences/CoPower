import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Admin from '../views/Admin.vue';
import Dashboard from '../views/dashboard/Dashboard.vue';
import DashboardEdit from '../views/dashboard/DashboardEdit.vue';
import ForgotPassword from '../views/ForgotPassword.vue';
import HMIPage from '../views/hmi/HMI.vue';
import Home from '@/views/Home.vue';
import Login from '../views/Login.vue';
import PublicDashboard from '../views/public/Dashboard.vue';
import Profile from '../views/Profile.vue';
import Register from '../views/Register.vue';
import ResetPassword from '../views/ResetPassword.vue';
import { StorageGet, StorageRemove, StorageSet } from '../services/Storage';
import { jwtDecode } from '../services/Utils';

/**
 * Navigation guard to check if user is admin before entering admin routes
 */
const checkAdmin = (to: any, from: any) => {
  let token = StorageGet('jwtToken');
  if (token) {
    const jwt = jwtDecode(token);
    if (jwt && jwt.role) {
      if ((jwt.role === 'admin') || (jwt.role === 'appadmin')) {
        return true;
      } else { return '/home'; }
    } else { return '/'; }
  } else { return '/'; }
};

// Define application routes
const routes: Array<RouteRecordRaw> = [
  { path: '', name: 'login', component: Login }, // Login as the default route
  { // Admin routes with child routes
    path: '/admin',
    component: Admin,
    beforeEnter: checkAdmin,
    children: [
      { path: 'api', component: () => import('@/views/APIList.vue') },
      { path: 'organisation', component: () => import('@/views/Organisation.vue') },
      { path: 'organisations', component: () => import('@/views/OrganisationList.vue') },
      { path: 'users', component: () => import('@/views/UsersList.vue') },
      { path: 'sensors', component: () => import('@/views/SensorsList.vue') }
    ],
  },
  { path: '/dashboard', name: 'dashboard', component: Dashboard }, // Dashboard main view
  { path: '/dashboard/edit', name: 'dashboard.edit', component: DashboardEdit }, // Dashboard edit view
  { path: '/forgot-password', name: 'forgot-password', component: ForgotPassword }, // Forgot password view
  { path: '/hmi', name: 'hmi', component: HMIPage }, // HMI view
  { path: '/home', name: 'home', component: Home }, // Home view
  { path: '/profile', name: 'user', component: Profile }, // User profile view
  { path: '/public', name: 'public', component: PublicDashboard }, // Public view
  { path: '/register/:token', name: 'register', component: ResetPassword }, // Register view
  { path: '/reset-password/:token', name: 'reset-password', component: ResetPassword } // Reset password view
];

const router = createRouter({
  history: createWebHistory('/dashboard/app/'),
  routes
});

router.beforeEach((to, from) => {
  const token: string | null = StorageGet('jwtToken') as string | null;

  // Check if token is not present and the user is trying to access a protected route
  if (
    !token &&
    to.path !== '/' &&
    to.path !== '/forgot-password' &&
    to.path.startsWith('/register/') !== true &&
    to.path.startsWith('/reset-password/') !== true &&
    to.path !== '/public'
  ) {
    return '/'; // Redirect to homepage if trying to access protected route without token
  } else {
    const claims = jwtDecode(token || '');
    if (claims && claims.exp && Date.now() >= claims.exp * 1000) { // Token has expired, clear it and redirect to homepage
      StorageSet('loginExpired', true);
      StorageRemove('jwtToken');
      return '/'; // Redirect to homepage or login page
    } else { return true; };
  }
});

export default router;
