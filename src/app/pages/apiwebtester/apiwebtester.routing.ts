import { Routes, RouterModule } from '@angular/router';

import { ApiWebTesterComponent } from './apiwebtester.component';
//import { AuthGuard }        from '../../services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    //canActivate: [AuthGuard],
    component: ApiWebTesterComponent
  }
];

export const routing = RouterModule.forChild(routes);