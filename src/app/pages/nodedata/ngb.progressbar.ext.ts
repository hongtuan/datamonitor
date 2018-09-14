import {Component, OnInit, Input, AfterViewInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngb-progressbar-ext',
  template: `
    <div style="width: 480px; height: auto;margin: 10px 10px">
      <ngb-progressbar
        type="info" height="30px" [value]="progressValue"
        [striped]="true" [animated]="true">{{progressText}}</ngb-progressbar>
      <div *ngIf="showProgressDesc" style="float: right;margin-bottom: 5px" [innerHtml]="progressDesc"></div>
    </div>
  `,
})
export class NgbProgressbarExt implements OnInit, AfterViewInit {
  taskName: string;
  refreshInterval: number = 1000;
  progressValue: number = 0;
  progressText: string = '0%';
  showProgressDesc: boolean = false;
  progressDesc: string = '';
  readonly  progressInfoUrl: string = '/api/sysinfo/glti';
  constructor(public activeModal: NgbActiveModal,private httpClient:HttpClient){}

  ngOnInit(): void {
  }

  refreshProgressInfo():void{
    const interval = setInterval(() => {
      this.httpClient
        .get(`${this.progressInfoUrl}/${this.taskName}`)
        .subscribe(taskInfo => {
          //console.log('taskInfo',taskInfo);
          //const value = (+taskInfo['data'].fc) / (+taskInfo['data'].tc) * 100;
          const finishCount = taskInfo['data'].fc;
          const totalCount = taskInfo['data'].tc;
          const value = Math.round(100 * finishCount / totalCount);
          if (value > 0) {
            //this.progressValue =  parseFloat(value.toFixed(2));
            this.progressValue =  value;
            this.progressText = `${this.progressValue}%`;
            this.progressDesc = `${finishCount} of ${totalCount} finished.`;
          }
          if(taskInfo['finished']){
            this.progressValue = 100;
            this.progressText = '100%';
            clearInterval(interval);
            this.activeModal.close(null);
          }
        },(error)=>{
          console.error(error);
        });
    },this.refreshInterval);
  }

  ngAfterViewInit(): void {
    //this.refreshProgressInfo();
  }

  public setTaskName(taskName):void {
    this.taskName = taskName;
  }

  public setProgressValue(value:number):void {
    this.progressValue = value;
  }

  public setProgressText(text:string):void {
    this.progressText = text;
  }

  public setProgressDesc(desc:string):void {
    this.progressDesc = desc;
  }

  public updateProgressInfo(value:number,text:string){
    this.progressValue = value;
    this.progressText = text;
  }
  public startRefreshProgress():void {
    this.progressValue = 0;
    this.progressText = '0%';
    this.progressDesc = 'Waiting for server process long task...';
    this.refreshProgressInfo();
  }
}
