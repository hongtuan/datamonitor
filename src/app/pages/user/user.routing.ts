import { Routes, RouterModule } from '@angular/router';

import { UserComponent }    from './user.component';
import { AuthGuard }        from '../../services/auth-guard.service';
const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: UserComponent
  }
];

export const routing = RouterModule.forChild(routes);