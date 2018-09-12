import {Component, OnInit, Input, AfterViewInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngb-progressbar-ext',
  template: `<div style="width: 480px; height: auto;margin: 10px 10px">
      <ngb-progressbar
        type="info" height="30px" [value]="progressValue"
        [striped]="true" [animated]="true">{{progressText}}</ngb-progressbar>
    </div>`,
})
export class NgbProgressbarExt implements OnInit, AfterViewInit {
  @Input() taskName: string;
  refreshInterval: number = 1000;
  progressValue: number = 0;
  progressText: string = '0%';
  progressInfoUrl: string = '/api/sysinfo/glti';
  constructor(public activeModal: NgbActiveModal,private httpClient:HttpClient){}

  ngOnInit(): void {
  }

  refreshProgressInfo():void{
    const interval = setInterval(() => {
      this.httpClient
        .get(`${this.progressInfoUrl}/${this.taskName}`)
        .subscribe(taskInfo => {
          //console.log('taskInfo',taskInfo);
          const value = (+taskInfo['data'].fc) / (+taskInfo['data'].tc) * 100;
          if (value > 0) {
            this.progressValue =  parseFloat(value.toFixed(2));
            this.progressText = `${this.progressValue}%`;
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
    this.refreshProgressInfo();
  }
}
