import { Routes, RouterModule }  from '@angular/router';
import { Pages } from './pages.component';

import { ModuleWithProviders } from '@angular/core';

export const routes: Routes = [
  {
    path: 'pages',
    component: Pages,
    children: [
      { path: '', redirectTo: 'hospital', pathMatch: 'full' },
      { path: 'hospital',  loadChildren: './hospital/hospital.module#HospitalModule' },
      { path: 'doctor',  loadChildren: './doctor/doctor.module#DoctorModule' },
      { path: 'user', loadChildren: './user/user.module#UserModule' },
      { path: 'apit', loadChildren: './sysutil/api.tester.module#ApiTesterModule' },
      { path: 'apit3', loadChildren: './mycomp03/mycomp03.module#MyComp03Module' },
      { path: 'sysinfo', loadChildren: './system/system.info.module#SystemInfoModule' },
      { path: 'newPath13', loadChildren: './newmodule/newmodule.module#NewModule' },
      { path: 'newPath14', loadChildren: './newmodule/newmodule.module#NewModule' },
      { path: 'newPath15', loadChildren: './newmodule/newmodule.module#NewModule' },
      { path: 'newPath15', loadChildren: './newmodule/newmodule.module#NewModule' },
      { path: 'newPath15', loadChildren: './newmodule/newmodule.module#NewModule' },
      { path: 'newPath15', loadChildren: './newmodule/newmodule.module#NewModule' },
      { path: 'newPath15', loadChildren: './newmodule/newmodule.module#NewModule' },
      { path: 'newPath15', loadChildren: './newmodule/newmodule.module#NewModule' },
      { path: 'path22', loadChildren: './newmodule/newmodule.module#NewXXModule' },
      { path: 'path33', loadChildren: './newmodule/newmodule.module#NewXXModule' },
      { path: 'path55', loadChildren: './newmodule/newmodule.module#NewXXModule' },
      { path: 'path55', loadChildren: './newmodule/newmodule.module#NewXXModule' },
      { path: 'path55', loadChildren: './newmodule/newmodule.module#NewXXModule' },
      { path: 'path55', loadChildren: './newmodule/newmodule.module#NewXXModule' },
      { path: 'path55', loadChildren: './newmodule/newmodule.module#NewXXModule' },
      { path: 'path55', loadChildren: './newmodule/newmodule.module#NewXXModule' },
      { path: 'path55', loadChildren: './newmodule/newmodule.module#NewXXModule' },
      { path: 'newcomp07', loadChildren: './newcomp07/newcomp07.module#newComp07Module' },
      { path: 'path55', loadChildren: './newmodule/newmodule.module#NewXXModule' },
      { path: 'newcomp08', loadChildren: './newcomp08/newcomp08.module#NewComp08Module' },
      //___newItemAppendHere___
      //{ path: 'ndp/:lid/:src/:sc', loadChildren: './nodedata/node-data-parser.module#NodeDataModule' }
      //,{ path: 'mp1', loadChildren: './mypage1/my.page1.module#MyPage1Module' }
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
