import { Component, OnInit, AfterViewInit } from '@angular/core';
//import { CommonHttpService } from '../../../services/common.http.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'assign-location',
  template: `
    <div class="ctn">
      <dual-list [source]="sourceList" [(destination)]="assignedList" 
        [key]="key" [display]="display" [filter]="true"
        [format]="format" height="200px"></dual-list>
      <div class="btrow" fxLayout="row" fxLayoutAlign="center center" fxLayoutGap="40px">
        <button class="btn btn-primary btn-block" (click)="save()">Save</button><button class="btn btn-primary btn-block" (click)="cancel()">Cancel</button>
      </div>
    </div>
  `,
  styles: [
    `.ctn {width: auto; height: auto;margin: 20px 20px}`,
    `.btrow {margin: 5px 10px}`,
    `.btn-block {background: #286090;width:60px}`
  ]
})
export class AssignLocationComponent implements OnInit, AfterViewInit {
  sourceList: any[] = [];
  assignedList: any[] = [];
  key: string = '_id';
  display: Array<string> = ['name'];

  format: any = {
    add: 'Assign',
    remove: 'Remove',
    all: 'SelectAll',
    none: 'None',
    direction: 'left-to-right',
    draggable: true
  };

  private savedLocationList:any[];
  private userId:string;

  setSavedLocationList(list):void {
    this.savedLocationList = list;
    console.log('setSavedLocationList called.');
  }

  setUserId(uid):void{
    this.userId = uid;
  }

  loadLocationList(cb): void {
    console.log('loadLocationList called.');
    this.httpClient.post(
      '/api/locations/ull/',
      {role:'root'})
      .subscribe(result => {
        //console.log(result);
        const dataCache = {};
        _.each(result,(item)=>{
          //console.log(item);
          let tmpObj = {_id:item._id,name:item.name};
          this.sourceList.push(tmpObj);
          dataCache[item._id] = tmpObj;
        });
        console.log('load data over.');
        if(cb) cb(dataCache);
      },error => {
        console.log(error);
      });
  }

  ngOnInit(): void {
    console.log('ngOnInit called.',this.savedLocationList);
    //load exist location first.
    this.loadLocationList((dataCache)=>{
      _.each(this.savedLocationList,(item)=>{
        //console.log('item',item);
        let tmpObj = dataCache[item];
        if(tmpObj) {
          this.assignedList.push(tmpObj);
        }
      });
      console.log('assignedList fill over.');
    });
  }

  constructor(
    public activeModal: NgbActiveModal,
    private httpClient: HttpClient){
    console.log('constructor called.');
  }

  save(): void {
    console.log(this.assignedList);
    const tmpA = [];
    _.each(this.assignedList,(item)=>{
      tmpA.push(item._id);
    });
    console.log(tmpA);
    this.httpClient
      .post('/api/users/'+this.userId,{loclist:tmpA})
      .subscribe(result=>{
        console.log(result);
      },error=>{
        console.log(error);
      });
    this.activeModal.close(tmpA);
  }

  cancel(): void {
    console.log(this.assignedList);
    this.activeModal.close({});
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit');
  }
}
