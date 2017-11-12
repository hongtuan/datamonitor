import { Component,OnInit } 					from '@angular/core';
import { Router,ActivatedRoute }  		from '@angular/router';
import { AuthService }            		from '../../services/auth.service';
import { alertlogviewerService }   from '../../services/alertlogviewer.service';

@Component({
  selector: 'alertlogviewer-form',
  templateUrl: './alertlogviewer.component.html',
  //styleUrls: ['./xxx.component.css']
})
export class alertlogviewerComponent  implements OnInit {
  settings = {
    columns: {
      ntag: {
        editable:false,
        title: 'NodeTag',
        type: 'string',
      },
      dt: {
        editable:false,
        title: 'AlertTime',
        type: '',
      },
      dv: {
        editable:false,
        title: 'Value',
        type: 'number',
      },
      at: {
        editable:false,
        title: 'AlertType',
        type: 'string',
      },
    },
    hideSubHeader:true,
    actions:{
      add:false,
      edit:false,
      delete:false,
    },
    pager:{
      perPage:20
    }
  };
  name:string='locName';
  lid:string;
  topLimit:Number=100;

  alertLogList:any[];
  showType:string = 'RH';

  constructor(private activatedRoute: ActivatedRoute,private router: Router,
	  private alertlogviewerService: alertlogviewerService,
	  private authService:AuthService) {
	  //console.log('alertlogviewerComponent constructor calle.');
  }

  ngOnInit(): void {
    //console.log('HospitalComponent:ngOnInit() called.');
    let params = this.activatedRoute.snapshot.params;
    this.lid = params['lid'];
    this.name = params['name'];
    this.loadAlertLog();
  }
  cvt2JsonStr(jsonObj:any):string {
    return JSON.stringify(jsonObj);
  }

  min(a,b):string{
    return Math.min(a,b).toString();
  }

  loadAlertLog():void{
    //console.log('log');
    if(this.topLimit<=0||this.topLimit>=1000){
      this.topLimit = 100;
    }
    this.alertlogviewerService.getAlertLogs(this.lid,this.topLimit).subscribe(
      rows => {
        this.alertLogList = rows;
        /*/console.log(JSON.stringify(this.alertLogList,null,2));
        this.alertLogList.forEach(function(alertLog){
          console.log(alertLog.dataType,alertLog.atimes,alertLog.alertInfos.length);
        });//*/
      },
      error =>{
        layer.msg('load data failed.'+error);
      });
  }
}
