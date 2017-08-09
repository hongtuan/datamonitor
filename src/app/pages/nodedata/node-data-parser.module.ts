import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';

import { NgaModule }                from '../../theme/nga.module';
import { NodeDataParserComponent }  from './node-data-parser';
import { NodeDataService }          from '../../services/node-data.service';
import { routing }                  from './node-data-parser.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    routing
  ],
  declarations: [
    NodeDataParserComponent
  ],
  providers: [NodeDataService]
})
export class NodeDataModule {}
