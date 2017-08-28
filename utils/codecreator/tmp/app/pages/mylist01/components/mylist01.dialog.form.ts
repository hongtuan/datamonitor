import { Component, Inject, Output, EventEmitter, OnInit } from '@angular/core';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';

import { Hospital }             from '../../../domain/hospital.mdl';
import { DlgMode }              from '../../../domain/definitions';

import { HospitalService }  from '../../../services/hospital.service';
import { AuthService }      from '../../../services/auth.service';

@Component({
  selector: 'hospital-dialog-form',
  templateUrl: 'hospital.dialog.form.html',
  styles: [
    `.dlgheader {
      height:30px;
    }
    .dlgbody{
      width: 640px;
      height:270px;
    }
    .dlgfooter{
      height:30px;
    }
    .full-width {
      width: 100%;
    }`
  ]
})
export class HospitalDialogForm implements OnInit {
  hospital:Hospital;
  dlgTitle:string = '新增医院';
  
  private dlgMode:DlgMode = DlgMode.Add;
  
  constructor(@Inject(MD_DIALOG_DATA) public data: any,
    public dialogRef: MdDialogRef<HospitalDialogForm>,
    private hospitalService: HospitalService,
    private authService:AuthService) {
    this.hospital = new Hospital({hcode:'',name:'',address:''});
    //console.log('HospitalDialogForm:constructor() called.');
  }

  ngOnInit(): void {
    if(this.data){
      console.log(JSON.stringify(this.data,null,2));
      this.dlgMode = DlgMode.Edit;
      this.hospital = this.data;
      
      this.dlgTitle = '修改医院';
    }
    //console.log('HospitalDialogForm:constructor() called.');
  }
  
  closeDlg():void {
    this.dialogRef.close(this.hospital);
  }

  onSubmit():void {
    //console.log('1.hospital=',this.hospital);    
    //this.hospital.alertPolicy = JSON.parse(this.alertPolicyStr);
    console.log('2.hospital=',this.hospital);
    if(this.dlgMode == DlgMode.Add) {
      //console.log('do add task.');
      var userInfo = this.authService.getUserInfo();
      //onsole.log('userInfo=',userInfo);
      this.hospitalService.addHospital(this.hospital,userInfo).subscribe(
        hospital => {
          this.hospital = hospital;
          //this.onLocationAdded.emit(this.hospital);
          layer.msg('医院添加成功.');
          this.closeDlg();
        },
        error => {
          layer.msg('add failed.'+error);
        }
      );
    }
    if(this.dlgMode == DlgMode.Edit){
      //console.log('do edit task.');
      this.hospitalService.updateHospital(this.hospital).subscribe(
        hospital =>{
          this.hospital = hospital;
          layer.msg('医院更新成功.');
          this.closeDlg();
        },
        error =>{
          layer.msg('update failed.'+error);
        }
      );
    }
    this.dialogRef.close(this.hospital);
  }
}
