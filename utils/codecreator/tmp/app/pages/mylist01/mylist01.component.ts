import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute }   from '@angular/router';
import { MdDialog } from '@angular/material';

import { Hospital }               from '../../domain/hospital.mdl';
import { HospitalDialogForm } from './components/hospital.dialog.form';

import { AuthService }      from '../../services/auth.service';
import { HospitalService }  from '../../services/hospital.service';
import { PagerService }        from '../../services/pager.service';

var DlgConfig = {
  disableClose:true,
  hasBackdrop:true,
  width:'660px',
  height:'400px'
};

@Component({
  selector: 'mylist01-list',
  templateUrl: 'mylist01.component.html',
  styles: [
    `.clkt {
      cursor: pointer;
    }
    `
  ]
})
export class MyList01Component implements OnInit {

  hospitals: Hospital[];
  // pager object
  pager: any = {};

  // paged items
  pagedItems: any[];

  //role:string;
  isMonitor:boolean = true;
  selectedHospital: Hospital;

  constructor(private route: ActivatedRoute,private router: Router,
    private hospitalService: HospitalService,
    private authService:AuthService,
    private pagerService: PagerService,
    public dialog: MdDialog) {
    //console.log('HospitalComponent constructor calle.');
    //console.log(moment().format('YYYY-MM-DD HH:mm:ss'),'called.');
  }

  getHospitals(userInfo:any): void {
    //console.log('getHospitals called');
    this.hospitalService.getHospitals(userInfo).subscribe(
      hospitals => {
        this.hospitals = hospitals;
        this.setPage(1);
      },
      error =>{
        layer.msg('load data failed.'+error);
      }
    );
  }

  setPage(page: number) {
    if(page < 1 || page > this.pager.totalPages) {
      return;
    }

    // get pager object from service
    this.pager = this.pagerService.getPager(this.hospitals.length, page);

    // get current page of items
    this.pagedItems = this.hospitals.slice(this.pager.startIndex, this.pager.endIndex + 1);
  }

  refreshList():void {
    var userInfo = this.authService.getUserInfo();
    //console.log('userInfo='+JSON.stringify(userInfo,null,2));
    //this.role = userInfo.role;
    this.isMonitor = userInfo.role != 'root';
    //console.log('isMonitor='+this.isMonitor);
    this.getHospitals(userInfo);
  }

  ngOnInit(): void {
    //console.log('HospitalComponent:ngOnInit() called.');
    this.refreshList();
    //console.log('this.isMonitor=',this.isMonitor);
  }

  onHospitalDeleted(hid: string) {
    this.hospitals = this.hospitals.filter(function(hospital){
      return hospital._id != hid;
    });
  }

  deleteHospital(hid:string):void {
    //locMgr.deleteHospital(hid);
    //console.log('cid='+cid);
    layerHelper.confirm('您确信要删除这条记录吗?', '删除确认',
      (index)=>{
      this.hospitalService.deleteHospital(hid).subscribe(
        updatedHospital =>{
          console.log('updatedHospital:',updatedHospital);
          this.onHospitalDeleted(updatedHospital._id);
          layer.msg('delete over.');
          //layer4ng.close(index);
        },
        error =>{
          console.log('error='+error);
          layer.msg(error);
        }
      );
    });
  }

  openAddDlg():void {
    let dialogRef = this.dialog.open(
      HospitalDialogForm,DlgConfig);

    dialogRef.afterClosed().subscribe(result => {
      //console.log(JSON.stringify(result,null,2));
      if(result){
        this.refreshList();
      }//this.hospitals.unshift(result);//加入分页后,改用刷新.
    });
  }

  openEditDlg(formData:any):void {
    let dialogRef = this.dialog.open(HospitalDialogForm,
      $.extend({}, DlgConfig,{data:formData}));

    dialogRef.afterClosed().subscribe(result => {
      //this.selectedOption = result;
      console.log(`Dialog result: ${result}`);
    });
  }
}

