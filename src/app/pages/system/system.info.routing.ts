import { Routes, RouterModule } from '@angular/router';

import { SystemInfoComponent } from './system.info.component';
//import { AuthGuard }        from '../../services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    //canActivate: [AuthGuard],
    component: SystemInfoComponent
  }
];

export const routing = RouterModule.forChild(routes);