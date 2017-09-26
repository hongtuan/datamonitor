import { Routes, RouterModule }  from '@angular/router';
import { Pages } from './pages.component';

import { ModuleWithProviders } from '@angular/core';



export const routes: Routes = [
  {
    path: 'pages',
    component: Pages,

    children: [
      { path: '', redirectTo: 'location', pathMatch: 'full' },
      { path: 'location',  loadChildren: './location/location.module#LocationModule' },
      { path: 'user', loadChildren: './user/user.module#UserModule' },
      { path: 'ndp/:lid/:src/:sc/:name', loadChildren: './nodedata/node-data-parser.module#NodeDataModule' },
      { path: 'sysinfo', loadChildren: './system/system.info.module#SystemInfoModule' },
      { path: 'apiwebtester', loadChildren: './apiwebtester/apiwebtester.module#ApiWebTesterModule' },
      { path: 'logviewer', loadChildren: './logviewer/logviewer.module#LogViewerModule' },
      { path: 'alv/:lid/:name', loadChildren: './alertlogviewer/alertlogviewer.module#alertlogviewerModule' },
      //___newItemAppendHere___
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
