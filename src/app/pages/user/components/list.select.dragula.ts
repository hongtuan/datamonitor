import { Component, Inject, Input, OnInit } from '@angular/core';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';

import { DragulaService } from 'ng2-dragula/ng2-dragula';

@Component({
  selector: 'list-select-dragula',
  templateUrl: 'list.select.dragula.html',
  styles: [
    `.dlgheader {
      height:30px;
    }
    .dlgbody{
      width: 100%;
      height:280px;      
      max-height:350px;
      min-height:280px;
    }
    .dlgfooter{
      height:30px;
    }
    .example-h2 {
      margin: 10px;
    }    
    .example-section {
      display: flex;
      align-content: center;
      align-items: center;
      height: 60px;
    }    
    .example-margin {
      margin: 0 10px;
    }
    .ml20{
      margin-left:20px;
    }
    .example-radio-group {
      display: inline-flex;
      flex-direction: row;
    }    
    .example-radio-button {
      margin: 5px;
    }    
    .example-selected-value {
      margin: 15px 0;
    }
    .lista{
      border:1px solid #000;
      width:200px;
      min-width:200px;
      min-height:100px;
    }
    .listb{
      border:1px solid blue;
      width:240px;
      min-width:200px;
      min-height:100px;
    }
    `
  ]
})
export class ListSelectDragula implements OnInit {
  dlgTitle:string = 'ListSelectDragula';
  options: any = {
    removeOnSpill: true
  }
  public selectedModel:Array<any>;
  public unSelectedModel:Array<any>;
  
  constructor(@Inject(MD_DIALOG_DATA) public data: any,
    public dialogRef: MdDialogRef<ListSelectDragula>,
    private dragulaService: DragulaService) {
    this.selectedModel = [
      {name:'app1',value:'lid1'},{name:'app2',value:'lid2'}
    ];
    this.unSelectedModel = [
      {name:'app3',value:'lid3'},
      {name:'app4',value:'lid4'},
      {name:'app5',value:'lid5'},
      {name:'app6',value:'lid6'},
      {name:'app7',value:'lid7'}
    ];
  }
  
  ngOnInit(): void {
    //console.log('ngOnInit-this.data',JSON.stringify(this.data,null,2));
    if(this.data){
      this.selectedModel = this.data.selectedModel;
      this.unSelectedModel = this.data.unSelectedModel;
    }
  }

  onSubmit():void {
    //console.log('onSubmit here.');
    this.dialogRef.close(this.selectedModel);
  }
}
