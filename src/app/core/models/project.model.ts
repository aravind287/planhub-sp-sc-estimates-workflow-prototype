export interface Project {
  id: string;
  name: string;
  location: string;
  bidDueDate: string;
  constructionType: string;
  projectType: string;
  buildingUse: string;
  status: 'active' | 'archived';
  trades: string[];
  gcCompany: string;
}
