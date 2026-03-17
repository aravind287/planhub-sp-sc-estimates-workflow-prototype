import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Project } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private projects: Project[] = [
    {
      id: 'proj-001',
      name: 'Orange Coast College Pool & Aquatics Center',
      location: 'Costa Mesa, CA',
      bidDueDate: '2026-03-28',
      constructionType: 'Institutional',
      projectType: 'New Construction',
      buildingUse: 'Aquatics / Recreation',
      status: 'active',
      trades: ['Electrical', 'Plumbing', 'HVAC', 'Mechanical'],
      gcCompany: 'Hensel Phelps Construction'
    },
    {
      id: 'proj-002',
      name: 'Riverside Commons Phase 2 Mixed-Use',
      location: 'Riverside, CA',
      bidDueDate: '2026-04-10',
      constructionType: 'Multi-Family',
      projectType: 'New Construction',
      buildingUse: 'Mixed-Use',
      status: 'active',
      trades: ['Concrete', 'Framing', 'Electrical', 'Plumbing', 'HVAC'],
      gcCompany: 'Turner Construction Company'
    },
    {
      id: 'proj-003',
      name: 'Sunset Ridge Apartments — 96 Units',
      location: 'Irvine, CA',
      bidDueDate: '2026-04-22',
      constructionType: 'Multi-Family',
      projectType: 'New Construction',
      buildingUse: 'Residential',
      status: 'active',
      trades: ['Framing', 'Roofing', 'Electrical', 'Plumbing', 'HVAC', 'Drywall', 'Flooring'],
      gcCompany: 'Clark Construction Group'
    },
    {
      id: 'proj-004',
      name: 'Harbor View Medical Center Expansion',
      location: 'Long Beach, CA',
      bidDueDate: '2026-03-14',
      constructionType: 'Healthcare',
      projectType: 'Renovation',
      buildingUse: 'Medical',
      status: 'active',
      trades: ['Electrical', 'Plumbing', 'HVAC', 'Medical Gas', 'Drywall', 'Flooring'],
      gcCompany: 'DPR Construction'
    },
    {
      id: 'proj-005',
      name: 'Downtown LA Office Tower Renovation',
      location: 'Los Angeles, CA',
      bidDueDate: '2026-02-28',
      constructionType: 'Commercial',
      projectType: 'Renovation',
      buildingUse: 'Office',
      status: 'active',
      trades: ['Electrical', 'Plumbing', 'HVAC', 'Drywall', 'Flooring', 'Framing'],
      gcCompany: 'Skanska USA Building'
    },
    {
      id: 'proj-006',
      name: 'Anaheim Convention Center Upgrade',
      location: 'Anaheim, CA',
      bidDueDate: '2026-05-05',
      constructionType: 'Commercial',
      projectType: 'Renovation',
      buildingUse: 'Convention / Events',
      status: 'active',
      trades: ['Electrical', 'Plumbing', 'HVAC', 'AV', 'Flooring'],
      gcCompany: 'McCarthy Building Companies'
    }
  ];

  getAll(): Observable<Project[]> {
    return of(this.projects);
  }

  getById(id: string): Observable<Project | undefined> {
    return of(this.projects.find(p => p.id === id));
  }
}
