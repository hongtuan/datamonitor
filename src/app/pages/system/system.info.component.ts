import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute }   from '@angular/router';

import { SystemInfoService }  from '../../services/system.info.service';


@Component({
  selector: 'system-info',
  templateUrl: 'system.info.component.html',
  styles: [
    `.clkt {
      cursor: pointer;
    }
    .licon{
      width:24px;
      height:24px;
    }
    #locListPanel{
      min-height:360px;
    }
    `
  ]
})
export class SystemInfoComponent implements OnInit {
  systemInfo:any[];
  
  constructor(private route: ActivatedRoute,private router: Router,
    private systemInfoService: SystemInfoService) {
    //console.log('HospitalComponent constructor calle.');
    //console.log(moment().format('YYYY-MM-DD HH:mm:ss'),'called.');
  }
  getTimeDistanceDesc(dist: number): string {
    var mSeconds = 1000;
    var mSecondsInMinute = mSeconds * 60;
    var mSecondsInHour = mSecondsInMinute * 60;
    var mSecondsInDay = mSecondsInHour * 24; // 3600*24*1000
  
    var d = Math.floor(dist / mSecondsInDay);
    var h = Math.floor(dist % mSecondsInDay / mSecondsInHour);
    var m = Math.floor(dist % mSecondsInHour / mSecondsInMinute);
    var s = Math.floor(dist % mSecondsInMinute / mSeconds);
  
    var dictArray = [
      [d, d > 1 ? 'days' : 'day'].join(''), [h, h > 1 ? 'hours' : 'hour'].join(''), [m, m > 1 ? 'minutes' : 'minute'].join(''), [s, s > 1 ? 'seconds' : 'second'].join('')
    ];
  
    if(dist >= mSecondsInDay) {
      //do nothing.
    } else if(mSecondsInHour <= dist && dist < mSecondsInDay) {
      dictArray = dictArray.slice(1);
    } else if(mSecondsInMinute <= dist && dist < mSecondsInHour) {
      dictArray = dictArray.slice(2);
    } else {
      dictArray = dictArray.slice(3);
    }
    return dictArray.join(',');
  }

  loadSystemInfo():void{
    this.systemInfoService.getSystemInfo().subscribe(
      systemInfo => {
        this.systemInfo = systemInfo;
        //var appRunTime = Date.now() - this.systemInfo.appStartTime;
        //this.systemInfo.push({name:'appRunTime',value:this.getTimeDistanceDesc(appRunTime)});
        //this.systemInfo.serverTime = new Date(this.systemInfo.serverTime).toLocaleString();
        //this.systemInfo.appStartTime = new Date(this.systemInfo.appStartTime).toLocaleString();
      },
      error =>{
        layer.msg('load data failed.'+error);
      }
    );    
  }

  ngOnInit(): void {
    this.loadSystemInfo();
  }
}

