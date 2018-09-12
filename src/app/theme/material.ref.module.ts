import {NgModule} from '@angular/core';
import {
  MatDialogModule,
  MatButtonModule,
  MatRadioModule,
  MatCheckboxModule,
  MatTabsModule,
  MatIconModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatSelectModule,
  MatAutocompleteModule,
  MatFormFieldModule,
  MatInputModule,
  MatSlideToggleModule,
  MatExpansionModule,
  MatCardModule,
  MatProgressBarModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';

import {MatSortModule} from '@angular/material/sort';
//import {ValidatorsModule} from 'ngx-validators'

export const materialModules = [
  MatDialogModule,
  MatButtonModule,
  MatRadioModule,
  MatCheckboxModule,
  MatTabsModule,
  MatIconModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatSelectModule,
  MatAutocompleteModule,
  MatFormFieldModule,
  MatInputModule,
  MatSlideToggleModule,
  MatExpansionModule,
  MatCardModule,
  MatSortModule,
  MatProgressBarModule,
  MatToolbarModule,
  MatTooltipModule,
  //ValidatorsModule
];

@NgModule({
  imports: [...materialModules],
  exports: [...materialModules],
})
export class MaterialRefModule {

}
