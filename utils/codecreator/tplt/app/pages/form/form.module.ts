import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule, MdNativeDateModule } from '@angular/material';

import { ___ComponentName___Service }  from '../../services/___componentFileNamePre___.service';
import { ___ComponentName___Component } from './___componentFileNamePre___.component';
import { routing } from './___componentFileNamePre___.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    MaterialModule,
    MdNativeDateModule,
    routing
  ],
  declarations: [
    ___ComponentName___Component
  ],
  providers: [___ComponentName___Service]
})
export class ___ComponentName___Module {}
