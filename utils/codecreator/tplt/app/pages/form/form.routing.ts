import { Routes, RouterModule } from '@angular/router';

import { ___ComponentName___Component } from './___componentFileNamePre___.component';
//import { AuthGuard }        from '../../services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    //canActivate: [AuthGuard],
    component: ___ComponentName___Component
  }
];

export const routing = RouterModule.forChild(routes);