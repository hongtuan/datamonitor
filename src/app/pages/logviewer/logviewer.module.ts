import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgaModule }        from '../../theme/nga.module';

//import { MaterialModule, MdNativeDateModule } from '@angular/material';
import { MaterialRefModule } from '../../theme/material.ref.module';
import { LogViewerService }  from '../../services/logviewer.service';
import { LogViewerComponent } from './logviewer.component';
import { routing } from './logviewer.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    NgaModule,
    //,
    //MdNativeDateModule,
    MaterialRefModule,
    routing
  ],
  declarations: [
    LogViewerComponent
  ],
  providers: [LogViewerService]
})
export class LogViewerModule {}
