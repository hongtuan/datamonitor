import {NgModule} from '@angular/core';

import {ButtonModule} from 'primeng/button';
import {SplitButtonModule} from 'primeng/splitbutton';
import {CardModule} from 'primeng/card';
import {AccordionModule} from 'primeng/accordion';
import {PanelModule} from 'primeng/panel';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {ToolbarModule} from 'primeng/toolbar';
import {DialogModule} from 'primeng/dialog';
import {TableModule} from 'primeng/table';
import {SliderModule} from 'primeng/slider';
import {DropdownModule} from 'primeng/dropdown';
import {MultiSelectModule} from 'primeng/multiselect';
import {InputSwitchModule} from 'primeng/inputswitch';
import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';

export const primeNgModules = [
  ButtonModule,
  SplitButtonModule,
  CardModule,
  AccordionModule,
  PanelModule,
  ScrollPanelModule,
  ToolbarModule,
  DialogModule,
  TableModule,
  SliderModule,
  DropdownModule,
  MultiSelectModule,
  InputSwitchModule,
  InputTextModule,
  InputTextareaModule,
];

@NgModule({
  imports: primeNgModules,
  exports: primeNgModules,
})
export class PrimeNgRefModule {
}
