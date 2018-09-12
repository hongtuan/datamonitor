import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { NgbDropdownModule,NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FlexLayoutModule } from '@angular/flex-layout';
//import { MaterialModule, MdNativeDateModule } from '@angular/material';
import { MaterialRefModule } from '../../theme/material.ref.module';
import { LocationDialogForm } from './components/location.dialog.form';

import { LocationComponent } from './location.component';
import { routing } from './location.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbDropdownModule,
    FlexLayoutModule,
    //MaterialModule,
    //MdNativeDateModule,
    MaterialRefModule,
    routing
  ],
  declarations: [
    LocationComponent,
    LocationDialogForm
  ],
  entryComponents: [
    LocationDialogForm,
  ],
  providers: [NgbModal]
})
export class LocationModule {}
