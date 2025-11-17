import { Routes } from '@angular/router';
import { authGuard } from './core/security/guards/auth.guard';

export const routes: Routes = [
  // ===== RUTAS PÚBLICAS =====
  {
    path: 'login',
    loadComponent: () => import('./core/authentication/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./core/authentication/register/register.component').then(m => m.RegisterComponent)
  },

  // ===== RUTAS PRIVADAS (requieren autenticación) =====
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./modules/layout/layout.component').then(m => m.LayoutComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./modules/home/home.component').then(m => m.HomeComponent)
          }
        ]
      },
      {
        path: 'profile',
        loadComponent: () => import('./modules/layout/layout.component').then(m => m.LayoutComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./modules/profile/profile.component').then(m => m.ProfileComponent)
          }
        ]
      },
      {
        path: 'test',
        loadComponent: () => import('./modules/layout/layout.component').then(m => m.LayoutComponent),
        children: [
          {
            path: 'start',
            loadComponent: () => import('./modules/test/test-start/test-start.component').then(m => m.TestStartComponent)
          },
          {
            path: 'question/:number',
            loadComponent: () => import('./modules/test/test-question/test-question.component').then(m => m.TestQuestionComponent)
          },
          {
            path: ':id/result',
            loadComponent: () => import('./modules/result/result.component').then(m => m.ResultComponent)
          }
        ]
      },
      {
        path: 'results',
        loadComponent: () => import('./modules/layout/layout.component').then(m => m.LayoutComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./modules/result/result.component').then(m => m.ResultComponent)
          }
        ]
      },
      {
        path: 'recommendation',
        loadComponent: () => import('./modules/layout/layout.component').then(m => m.LayoutComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./modules/recommendation/recommendation.component').then(m => m.RecommendationComponent)
          }
        ]
      }
    ]
  },

  // ===== REDIRECTS =====
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
