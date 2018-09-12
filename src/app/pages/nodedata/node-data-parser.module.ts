import { NgModule }       from '@angular/core';
//import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgaModule }                from '../../theme/nga.module';
import { CommonModule }   from '@angular/common';
import { NgbProgressbarModule,NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule }    from '@angular/forms';
//import { FlexLayoutModule } from '@angular/flex-layout';
//import { MaterialModule, MdNativeDateModule } from '@angular/material';
import { MaterialRefModule } from '../../theme/material.ref.module';

import { NodeDataParserComponent }  from './node-data-parser';
import {NgbProgressbarExt} from './ngb.progressbar.ext';
import { NodeDataService }          from '../../services/node-data.service';
import { routing }                  from './node-data-parser.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    NgbProgressbarModule,
    //FlexLayoutModule,
    //MaterialModule,
    //MdNativeDateModule,
    MaterialRefModule,
    routing
  ],
  declarations: [
    NodeDataParserComponent,
    NgbProgressbarExt
  ],
  entryComponents: [
    NgbProgressbarExt
  ],
  providers: [NgbModal,NodeDataService]
})
export class NodeDataModule {}
