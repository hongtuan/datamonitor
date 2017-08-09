import { Routes, RouterModule } from '@angular/router';

//import { AuthGuard }        from '../../services/auth-guard.service';
import { NodeDataParserComponent } from './node-data-parser';

const routes: Routes = [
  {
    //path: 'ndp/:lid/:src/:sc',
    path: '',
    component: NodeDataParserComponent
  }
];

export const routing = RouterModule.forChild(routes);