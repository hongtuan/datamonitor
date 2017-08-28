import { Routes, RouterModule } from '@angular/router';

import { LogViewerComponent } from './logviewer.component';
//import { AuthGuard }        from '../../services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    //canActivate: [AuthGuard],
    component: LogViewerComponent
  }
];

export const routing = RouterModule.forChild(routes);