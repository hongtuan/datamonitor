import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { SystemInfoService }  from '../../services/system.info.service';
import { SystemInfoComponent } from './system.info.component';
import { routing } from './system.info.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    routing
  ],
  declarations: [
    SystemInfoComponent
  ],
  providers: [SystemInfoService]
})
export class SystemInfoModule {}
