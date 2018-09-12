import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialRefModule } from '../../theme/material.ref.module';
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { UserDialogForm } from './components/user.dialog.form';
import { AssignLocationComponent } from './components/assign.location';

import { UserComponent }   from './user.component';
import { routing } from './user.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbDropdownModule,
    FlexLayoutModule,
    MaterialRefModule,
    AngularDualListBoxModule,
    routing
  ],
  declarations: [
    UserComponent,
    UserDialogForm,
    AssignLocationComponent
  ],
  entryComponents: [
    UserDialogForm,
    AssignLocationComponent
  ],
  providers: [NgbModal]
})
export class UserModule {}
