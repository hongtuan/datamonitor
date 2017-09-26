import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgaModule }        from '../../theme/nga.module';
import { MaterialModule, MdNativeDateModule } from '@angular/material';

import { ApiWebTesterService }  from '../../services/apiwebtester.service';
import { ApiWebTesterComponent } from './apiwebtester.component';
import { routing } from './apiwebtester.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    NgaModule,
    MaterialModule,
    MdNativeDateModule,
    routing
  ],
  declarations: [
    ApiWebTesterComponent
  ],
  providers: [ApiWebTesterService]
})
export class ApiWebTesterModule {}
