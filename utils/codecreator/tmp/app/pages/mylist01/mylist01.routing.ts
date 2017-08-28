import { Routes, RouterModule } from '@angular/router';

import { MyList01Component } from './mylist01.component';
//import { AuthGuard }        from '../../services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    //canActivate: [AuthGuard],
    component: MyList01Component
  }
];

export const routing = RouterModule.forChild(routes);
