import { Component, Inject, Output, EventEmitter, OnInit } from '@angular/core';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';

import { ___ModelName___ }             from '../../../domain/___modelFileNamePre___.mdl';
import { DlgMode }              from '../../../domain/definitions';

import { ___ComponentName___Service }  from '../../../services/___componentFileNamePre___.service';
import { AuthService }      from '../../../services/auth.service';

@Component({
  selector: '___componentFileNamePre___-dialog-form',
  templateUrl: '___componentFileNamePre___.dialog.form.html',
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
export class ___ModelName___DialogForm implements OnInit {
  model:___ModelName___;
  dlgTitle:string = '新增医院';

  private dlgMode:DlgMode = DlgMode.Add;

  constructor(@Inject(MD_DIALOG_DATA) public data: any,
    public dialogRef: MdDialogRef<___ModelName___DialogForm>,
    private ___componentFileNamePre___Service: ___ComponentName___Service,
    private authService:AuthService) {
    //this.model = new any({hcode:'',name:'',address:''});
  }

  ngOnInit(): void {
    if(this.data){
      //console.log(JSON.stringify(this.data,null,2));
      this.dlgMode = DlgMode.Edit;
      this.model = this.data;

      this.dlgTitle = '修改医院';
    }
  }

  closeDlg():void {
    this.dialogRef.close(this.model);
  }

  onSubmit():void {
    //console.log('1.model=',this.model);
    //this.model.alertPolicy = JSON.parse(this.alertPolicyStr);
    console.log('2.model=',this.model);
    if(this.dlgMode == DlgMode.Add) {
      //console.log('do add task.');
      var userInfo = this.authService.getUserInfo();
      //onsole.log('userInfo=',userInfo);
      this.___componentFileNamePre___Service.addModel(this.model,userInfo).subscribe(
        model => {
          this.model = model;
          //this.onLocationAdded.emit(this.model);
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
      this.___componentFileNamePre___Service.updateModel(this.model).subscribe(
        model =>{
          this.model = model;
          layer.msg('医院更新成功.');
          this.closeDlg();
        },
        error =>{
          layer.msg('update failed.'+error);
        }
      );
    }
    this.dialogRef.close(this.model);
  }
}
