import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule, MdNativeDateModule } from '@angular/material';

import { LocationDialogForm } from './components/location.dialog.form';

import { LocationComponent } from './location.component';
import { routing } from './location.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbDropdownModule,
    FlexLayoutModule,
    MaterialModule,
    MdNativeDateModule,    
    routing
  ],
  declarations: [
    LocationComponent,
    LocationDialogForm
  ],
  entryComponents: [
    LocationDialogForm,
  ],
  providers: []
})
export class LocationModule {}
