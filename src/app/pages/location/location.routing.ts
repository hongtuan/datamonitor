import { Routes, RouterModule } from '@angular/router';

import { LocationComponent } from './location.component';
import { AuthGuard }        from '../../services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: LocationComponent
  }
];

export const routing = RouterModule.forChild(routes);