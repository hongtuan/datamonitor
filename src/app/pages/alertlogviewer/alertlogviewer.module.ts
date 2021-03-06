import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { NgaModule }      from '../../theme/nga.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { FlexLayoutModule } from '@angular/flex-layout';
//import { MatNativeDateModule } from '@angular/material';
import { MaterialRefModule } from '../../theme/material.ref.module';
import { alertlogviewerService }  from '../../services/alertlogviewer.service';
import { alertlogviewerComponent } from './alertlogviewer.component';
import { routing } from './alertlogviewer.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    Ng2SmartTableModule,
    FlexLayoutModule,
    //MaterialModule,
    //MatNativeDateModule,
    MaterialRefModule,
    routing
  ],
  declarations: [
    alertlogviewerComponent
  ],
  providers: [alertlogviewerService]
})
export class alertlogviewerModule {}
