import { Component, OnInit }      from '@angular/core';
import { Router,ActivatedRoute }  from '@angular/router';
import { MdDialog }               from '@angular/material';

import { ___ModelName___ }        from '../../domain/___modelFileNamePre___.mdl';
import { ___ModelName___DialogForm }     from './components/___componentFileNamePre___.dialog.form';

import { AuthService }            from '../../services/auth.service';
import { ___ComponentName___Service }        from '../../services/___componentFileNamePre___.service';
import { PagerService }           from '../../services/pager.service';
//import {any} from "../../../../../../src/app/domain/model.mdl";

var DlgConfig = {
  disableClose:true,
  hasBackdrop:true,
  width:'660px',
  height:'400px'
};

@Component({
  selector: '___componentFileNamePre___-list',
  templateUrl: '___componentFileNamePre___.component.html',
  styles: [
    `.clkt {
      cursor: pointer;
    }
    `
  ]
})
export class ___ComponentName___Component implements OnInit {

  models: any[];
  // pager object
  pager: any = {};

  // paged items
  pagedItems: any[];

  //role:string;
  isMonitor:boolean = true;
  //selectedHospital: any;

  constructor(private route: ActivatedRoute,private router: Router,
    private ___componentFileNamePre___Service: ___ComponentName___Service,
    private authService:AuthService,
    private pagerService: PagerService,
    public dialog: MdDialog) {
    //console.log('HospitalComponent constructor calle.');
    //console.log(moment().format('YYYY-MM-DD HH:mm:ss'),'called.');
  }

  getModels(userInfo:any): void {
    //console.log('getHospitals called');
    this.___componentFileNamePre___Service.getModels(userInfo).subscribe(
      hospitals => {
        this.models = hospitals;
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
    this.pager = this.pagerService.getPager(this.models.length, page);

    // get current page of items
    this.pagedItems = this.models.slice(this.pager.startIndex, this.pager.endIndex + 1);
  }

  refreshList():void {
    var userInfo = this.authService.getUserInfo();
    //console.log('userInfo='+JSON.stringify(userInfo,null,2));
    //this.role = userInfo.role;
    this.isMonitor = userInfo.role != 'root';
    //console.log('isMonitor='+this.isMonitor);
    this.getModels(userInfo);
  }

  ngOnInit(): void {
    //console.log('HospitalComponent:ngOnInit() called.');
    this.refreshList();
    //console.log('this.isMonitor=',this.isMonitor);
  }

  onModelDeleted(hid: string) {
    this.models = this.models.filter(function(model){
      return model._id != hid;
    });
  }

  deleteModel(hid:string):void {
    //locMgr.deleteHospital(hid);
    //console.log('cid='+cid);
    layerHelper.confirm('您确信要删除这条记录吗?', '删除确认',
      (index)=>{
      this.___componentFileNamePre___Service.deleteModel(hid).subscribe(
        updatedModel =>{
          console.log('updatedHospital:',updatedModel);
          this.onModelDeleted(updatedModel._id);
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
    let dialogRef = this.dialog.open(___ModelName___DialogForm,DlgConfig);

    dialogRef.afterClosed().subscribe(result => {
      //console.log(JSON.stringify(result,null,2));
      if(result){
        this.refreshList();
      }//this.models.unshift(result);//加入分页后,改用刷新.
    });
  }

  openEditDlg(formData:any):void {
    let dialogRef = this.dialog.open(___ModelName___DialogForm,
      $.extend({}, DlgConfig,{data:formData}));

    dialogRef.afterClosed().subscribe(result => {
      //this.selectedOption = result;
      console.log(`Dialog result: ${result}`);
    });
  }
}

