import { Component, Inject, Output, EventEmitter, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { User }                         from '../../../domain/user.mdl';
import { Location }                     from '../../../domain/location.mdl';
import { DlgMode, AuthorizationInfo }   from '../../../domain/definitions';


import { LocationService }    from '../../../services/location.service';
import { UserService }        from '../../../services/user.service';


@Component({
  selector: 'user-dialog-form',
  templateUrl: 'user.dialog.form.html',
  styles: [
    `.dlgheader {
      height: 24px;
      margin: 0;
    }
    .dlgbody {
      width: 540px;
      height:180px;
      border: solid 1px #e4e5e7;
      margin: 5px 5px 10px 5px;
    }
    .dlgfooter{
      height: 24px;
      margin: 0;
    }
    .full-width {
      width: 100%;
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
    `
  ]
})
export class UserDialogForm implements OnInit {

  private errMsg: string;
  private locations:Location[];

  user: User;
  roles:any[] = [];
  dlgTitle:string = 'AddUser';

  private dlgMode:DlgMode = DlgMode.Add;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UserDialogForm>,
    private locationService: LocationService,
    private userService:UserService,
    public dialog: MatDialog) {

    this.user = new User({name:'',email:''});
    for(let ai of AuthorizationInfo){
      this.roles.push(ai);
    }
    //console.log('roles=',JSON.stringify(this.roles,null,2));
    //console.log('UserDialogForm:constructor called.');
  }

  authedLocs:Array<any>=[];
  unAuthedLocs:Array<any>=[];

  updateAuthedLocInfo():void {
    this.locationService.getLocations({role:'root'}).subscribe(
      locations =>{
        this.locations = locations;
        //console.log('locations.length=',this.locations.length);
        //console.log('calc authedLocs and unAuthedLocs...');
        if(this.locations && this.locations.length > 0) {
          var authedLids = [];
          if(this.user && this.user.loclist.length > 0) {
            authedLids = [...this.user.loclist];
          }

          this.authedLocs = [];
          this.unAuthedLocs = [];
          for(let location of this.locations) {
            var tmpObj = {
              name: location.name,
              value: location._id
            };
            if(authedLids.includes(location._id)) {
              this.authedLocs.push(tmpObj);
            } else {
              this.unAuthedLocs.push(tmpObj);
            }
          }
          //console.log('updateAuthedLocInfo over.');
        }
      },
      error =>{
        layer.msg('load data failed.'+error);
      }
    );

  }

  ngOnInit(): void {
    if(this.data){
      this.dlgMode = DlgMode.Edit;
      this.user = this.data;
      this.dlgTitle = 'EditUser';
    }
    this.updateAuthedLocInfo();
  }

  isDisabled():boolean{
    return this.dlgMode === DlgMode.Edit;
  }


  onSubmit():void {
    //console.log('onSubmit here.',JSON.stringify(this.user,null,2));
    //this.dialogRef.close(this.user);
    if(this.dlgMode == DlgMode.Add) {
      this.userService.addUser(this.user).subscribe(
        user => {
          this.user = user;
          //this.onUserAdded.emit(user);
          layer.msg('User add success.');
          this.dialogRef.close(this.user);
        },
        error => {
          this.errMsg = <any>error;
          layer.msg('add failed.'+this.errMsg);
        }
      );
    }
    if(this.dlgMode == DlgMode.Edit){
      //console.log(JSON.stringify(this.user,null,2));
      this.userService.updateUser(this.user).subscribe(
        user => {
          this.user = user;
          layer.msg('User update success.');
          this.dialogRef.close(this.user);
        },
        error =>{
          this.errMsg = <any>error;
          layer.msg('update failed.'+this.errMsg);
        }
      );
    }
  }
}
