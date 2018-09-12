import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';

//import { Ng2Bs3ModalModule }      from 'ng2-bs3-modal/ng2-bs3-modal';

import { routing }       from './pages.routing';
import { NgaModule }     from '../theme/nga.module';
//import { AppTranslationModule } from '../app.translation.module';

import { Pages } from './pages.component';

@NgModule({
  imports: [CommonModule, //AppTranslationModule,
    NgaModule, routing],
  declarations: [Pages]
})
export class PagesModule {
}
