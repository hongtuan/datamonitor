import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MyList01Service }  from '../../services/mylist01.service';
import { MyList01Component } from './mylist01.component';
import { routing } from './mylist01.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    routing
  ],
  declarations: [
    MyList01Component
  ],
  providers: [MyList01Service]
})
export class MyList01Module {}
