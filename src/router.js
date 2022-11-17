import { createRouter, createWebHistory } from 'vue-router';
import Auth from './Auth.vue';
import Cookies from 'js-cookie';
import axios from 'axios';

const routes = [
  {
    path: '/',
    component: Auth,
    children: [
      {
        path: '/dashboard',
        alias: '/',
        name: 'dashboard',
        component: () => import('./views/dashboard/Base.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/fund_sources',
        name: 'fund sources',
        component: () => import('./views/fund_sources/Base.vue'),
        meta: {
          requiresAuth: true,
          requiredPermission: ['fund_sources:manage'],
        },
      },
      {
        path: '/wfps',
        name: 'wfps',
        component: () => import('./views/wfps/Base.vue'),
        meta: {
          requiresAuth: true,
          requiredPermission: ['wfps:manage', 'wfps:eval_l1', 'wfps:eval_l2'],
        },
      },
      {
        path: '/ppmps',
        name: 'ppmps',
        component: () => import('./views/ppmps/Base.vue'),
        meta: {
          requiresAuth: true,
          requiredPermission: ['ppmps:manage', 'ppmps:eval_l1', 'ppmps:eval_l2'],
        },
      },
      {
        path: '/apps',
        name: 'apps',
        component: () => import('./views/apps/Base.vue'),
        meta: {
          requiresAuth: true,
          requiredPermission: ['apps:manage', 'apps:eval_l1', 'apps:eval_l2'],
        },
      },
    ],
  },
  {
    path: '/403',
    component: () => import('./views/errors/403.vue'),
  },
  {
    path: '/404',
    component: () => import('./views/errors/404.vue'),
  },
  {
    path: '/409',
    component: () => import('./views/errors/409.vue'),
  },
  {
    path: '/500',
    component: () => import('./views/errors/500.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const redirectLogin = () => window.location = import.meta.env.VITE_PORTAL_URL;

const setAuth = (user, route) => {
  Cookies.set('auth_user', JSON.stringify({
    avatar: user.avatar,
    name: user.name,
  }));
  
  const permissions = user.permissions.map(permission => {
    return {
      n: permission.name,
      o: route.meta.requiredPermission?.includes(permission.name) && permission.offices?.length > 0
        ? permission.offices.map(office => office.id)
        : [],
    }
  });
  
  Cookies.set('auth_permissions', JSON.stringify(permissions));
};

router.beforeResolve(async (to, from) => {
  if (to.meta.requiresAuth) {
    const auth_token = Cookies.get('auth_token');
  
    if (!auth_token) redirectLogin();
  
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + auth_token;
  
    const permissions = ['fund_sources', 'wfps', 'ppmps', 'apps'];
  
    await axios.post(`${import.meta.env.VITE_PORTAL_API_URL}/auth?permissions=${permissions.join()}`)
      .then(async response => {
        await setAuth(response.data, to);
      })
      .catch(error => {
        if (error.response.status === 404) {
          redirectLogin();
        }
      });
  
    // catch all 403, 404, 409, and 500 errors
    axios.interceptors.response.use(response => response, error => {
      switch (error.response.status) {
        case 401:
          redirectLogin();
          break;
      
        case 403:
        case 404:
        case 409:
        case 500:
          console.log(error.response.data);
          router.push(`/${error.response.status}`);
          break;
      }
    
      return Promise.reject(error);
    });
  }
});

export default router;