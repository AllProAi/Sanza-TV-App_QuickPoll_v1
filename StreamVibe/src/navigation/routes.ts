import { lazy } from 'react';

// Lazy loaded route components
const HomePage = lazy(() => import('../pages/HomePage'));
const BrowsePage = lazy(() => import('../pages/BrowsePage'));
const DetailPage = lazy(() => import('../pages/DetailPage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const ErrorPage = lazy(() => import('../pages/ErrorPage'));
const PlayerPage = lazy(() => import('../pages/PlayerPage'));

// Route interface
export interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  exact?: boolean;
  children?: RouteConfig[];
  meta?: {
    title?: string;
    requiresAuth?: boolean;
    icon?: string;
    order?: number;
    hideFromNav?: boolean;
    [key: string]: string | number | boolean | undefined;
  };
}

// App routes configuration
export const routes: RouteConfig[] = [
  {
    path: '/',
    component: HomePage,
    exact: true,
    meta: {
      title: 'Home',
      icon: 'home',
      order: 1,
    },
  },
  {
    path: '/browse',
    component: BrowsePage,
    meta: {
      title: 'Browse',
      icon: 'browse',
      order: 2,
    },
    children: [
      {
        path: '/browse/:category',
        component: BrowsePage,
        meta: {
          title: 'Browse Category',
        },
      },
    ],
  },
  {
    path: '/details/:id',
    component: DetailPage,
    meta: {
      title: 'Details',
    },
  },
  {
    path: '/search',
    component: SearchPage,
    meta: {
      title: 'Search',
      icon: 'search',
      order: 3,
    },
  },
  {
    path: '/profile',
    component: ProfilePage,
    meta: {
      title: 'Profile',
      icon: 'profile',
      order: 4,
      requiresAuth: true,
    },
  },
  {
    path: '/settings',
    component: SettingsPage,
    meta: {
      title: 'Settings',
      icon: 'settings',
      order: 5,
    },
  },
  {
    path: '/player/:contentId',
    component: PlayerPage,
    meta: {
      title: 'Player',
      hideFromNav: true,
    },
  },
  {
    path: '*',
    component: ErrorPage,
    meta: {
      title: 'Not Found',
    },
  },
];

// Main navigation items
export const getMainNavItems = () => {
  return routes
    .filter(route => route.meta?.order != null && !route.meta?.hideFromNav)
    .sort((a, b) => (a.meta?.order || 0) - (b.meta?.order || 0));
};

// Get route by path
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  // Check for exact match first
  let route = routes.find(r => r.path === path);
  if (route) return route;
  
  // Check for child routes
  for (const parentRoute of routes) {
    if (parentRoute.children) {
      route = parentRoute.children.find(r => r.path === path);
      if (route) return route;
    }
  }
  
  // Check for dynamic routes
  for (const parentRoute of routes) {
    if (parentRoute.path.includes(':')) {
      const pathParts = parentRoute.path.split('/');
      const targetParts = path.split('/');
      
      if (pathParts.length === targetParts.length) {
        let match = true;
        for (let i = 0; i < pathParts.length; i++) {
          if (pathParts[i].startsWith(':')) continue;
          if (pathParts[i] !== targetParts[i]) {
            match = false;
            break;
          }
        }
        if (match) return parentRoute;
      }
    }
    
    // Check for dynamic child routes
    if (parentRoute.children) {
      for (const childRoute of parentRoute.children) {
        if (childRoute.path.includes(':')) {
          const pathParts = childRoute.path.split('/');
          const targetParts = path.split('/');
          
          if (pathParts.length === targetParts.length) {
            let match = true;
            for (let i = 0; i < pathParts.length; i++) {
              if (pathParts[i].startsWith(':')) continue;
              if (pathParts[i] !== targetParts[i]) {
                match = false;
                break;
              }
            }
            if (match) return childRoute;
          }
        }
      }
    }
  }
  
  // Return the 404 route if no match is found
  return routes.find(r => r.path === '*');
}; 