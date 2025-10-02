import { Routes } from '@angular/router';
import { authGuard, guestGuard, adminGuard } from './core/guards';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  // Public routes (without layout)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  // Protected routes (with layout)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'my-team',
        loadComponent: () => import('./features/team/my-team/my-team.component').then(m => m.MyTeamComponent)
      },
      {
        path: 'players',
        loadComponent: () => import('./features/players/player-list/player-list.component').then(m => m.PlayerListComponent)
      }
    ]
  },
  // Admin routes (with admin layout)
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'players',
        loadComponent: () => import('./features/admin/players/admin-players.component').then(m => m.AdminPlayersComponent)
      },
      {
        path: 'teams',
        loadComponent: () => import('./features/admin/teams/admin-teams.component').then(m => m.AdminTeamsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
