import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule, MdNativeDateModule } from '@angular/material';

import { DragulaModule } from 'ng2-dragula';

import { UserDialogForm } from './components/user.dialog.form';
import { ListSelectDragula } from './components/list.select.dragula';

import { UserComponent }   from './user.component';
import { routing } from './user.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbDropdownModule,
    FlexLayoutModule,
    MaterialModule,
    MdNativeDateModule,
    DragulaModule,
    routing
  ],
  declarations: [
    UserComponent,
    UserDialogForm,    
    ListSelectDragula
  ],
  entryComponents: [
    UserDialogForm,
    ListSelectDragula
  ],
  providers: []
})
export class UserModule {}
