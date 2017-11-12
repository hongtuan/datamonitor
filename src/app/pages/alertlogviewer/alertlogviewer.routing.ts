import { Routes, RouterModule } from '@angular/router';

import { alertlogviewerComponent } from './alertlogviewer.component';
//import { AuthGuard }        from '../../services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    //canActivate: [AuthGuard],
    component: alertlogviewerComponent
  }
];

export const routing = RouterModule.forChild(routes);