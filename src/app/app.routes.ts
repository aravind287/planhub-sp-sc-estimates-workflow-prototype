import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/sp/pipeline', pathMatch: 'full' },

  // SP Routes
  { path: 'sp/pipeline', loadComponent: () => import('./features/sp/pipeline/pipeline.component').then(m => m.PipelineComponent) },
  { path: 'sp/bid-planner', loadComponent: () => import('./features/sp/bid-planner/bid-planner.component').then(m => m.BidPlannerComponent) },
  { path: 'sp/projects/:id/subcontractors', loadComponent: () => import('./features/sp/project-subcontractors/project-subcontractors.component').then(m => m.ProjectSubcontractorsComponent) },
  { path: 'sp/estimates/create', loadComponent: () => import('./features/sp/estimate-create/estimate-create.component').then(m => m.EstimateCreateComponent) },
  { path: 'sp/estimates/:id', loadComponent: () => import('./features/sp/estimate-detail/estimate-detail.component').then(m => m.EstimateDetailComponent) },

  // SC Routes
  { path: 'sc/dashboard', loadComponent: () => import('./features/sc/dashboard/sc-dashboard.component').then(m => m.ScDashboardComponent) },
  { path: 'sc/requests', loadComponent: () => import('./features/sc/my-requests/my-requests.component').then(m => m.MyRequestsComponent) },
  { path: 'sc/create-rfq', loadComponent: () => import('./features/sc/create-rfq/create-rfq.component').then(m => m.CreateRfqComponent) },
  { path: 'sc/compare', loadComponent: () => import('./features/sc/estimate-comparison/estimate-comparison.component').then(m => m.EstimateComparisonComponent) },
  { path: 'sc/projects/:id', loadComponent: () => import('./features/sc/sc-project/sc-project.component').then(m => m.ScProjectComponent) },

  { path: '**', redirectTo: '/sp/pipeline' }
];
