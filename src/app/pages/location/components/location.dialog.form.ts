import { Component, Inject, Output, EventEmitter, OnInit } from '@angular/core';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';

import { Location }             from '../../../domain/location.mdl';
import { DlgMode }              from '../../../domain/definitions';

import { LocationService }  from '../../../services/location.service';
import { AuthService }      from '../../../services/auth.service';


@Component({
  selector: 'location-dialog-form',
  templateUrl: 'location.dialog.form.html',
  styles: [
    `.dlgheader {
      height:30px;
    }
    .dlgbody{
      width: 660px;
      height:400px;
    }
    .dlgfooter{
      height:30px;
    }
    .full-width {
      width: 100%;
    }`
  ]
})
export class LocationDialogForm implements OnInit {
  location:Location;
  alertPolicyStr:string;

  defaultAlertPolicy = [
    {name:'SS',desc:'Signal Strength',range:{min:20,max:150}},
    {name:'SC',desc:'Super Cap Voltage',range:{min:2.4,max:3.6}},
    {name:'AH',desc:'Ambient Humidity',range:{min:45,max:45}},
    {name:'RH',desc:'Roof Humidity',range:{min:40,max:90}},
    {name:'DH',desc:'Delta Humidity',range:{min:-15,max:0}},
    {name:'TP',desc:'Temperature',range:{min:60,max:80}},
    {name:'FS',desc:'Fan Speed',range:{min:1,max:1}},
    {name:'FC',desc:'FanCounts',range:{min:0,max:0}},
    {name:'FD',desc:'FanData',range:{min:0,max:0}}
  ];
  
  dlgTitle:string = 'AddLocation';
  
  private dlgMode:DlgMode = DlgMode.Add;
  
  constructor(@Inject(MD_DIALOG_DATA) public data: any,
    public dialogRef: MdDialogRef<LocationDialogForm>,
    private locationService: LocationService,
    private authService:AuthService) {
    this.location = new Location({name:'',address:'',contactInfo:'',emails:'',
    datasrc:'C47F51016BAC',snapcount:30,synperiod:600,monitperiod:600,alertPolicy:this.defaultAlertPolicy});
    this.alertPolicyStr = JSON.stringify(this.defaultAlertPolicy,null,2);
    console.log('LocationDialogForm:constructor() called.');
  }

  ngOnInit(): void {
    if(this.data){
      console.log(JSON.stringify(this.data,null,2));
      this.dlgMode = DlgMode.Edit;
      this.location = this.data;
      this.alertPolicyStr = JSON.stringify(this.location.alertPolicy,null,2);
      this.dlgTitle = 'EditLocation';
    }
    console.log('LocationDialogForm:constructor() called.');
  }
  
  closeDlg():void {
    this.dialogRef.close(this.location);
  }

  onSubmit():void {
    console.log('1.location=',this.location);    
    this.location.alertPolicy = JSON.parse(this.alertPolicyStr);
    console.log('2.location=',this.location);
    if(this.dlgMode == DlgMode.Add){
      console.log('do add task.');
      var userInfo = this.authService.getUserInfo();
      this.locationService.addLocation(this.location,userInfo).subscribe(
        location =>{
          this.location = location;
          //this.onLocationAdded.emit(this.location);
          layer.msg('add success.');
          this.closeDlg();
        },
        error =>{
          layer.msg('add failed.'+error);
        }
      );
    }
    if(this.dlgMode == DlgMode.Edit){
      console.log('do edit task.');
      this.locationService.updateLocation(this.location).subscribe(
        location =>{
          this.location = location;
          layer.msg('update success.');
          this.closeDlg();
        },
        error =>{
          layer.msg('update failed.'+error);
        }
      );
    }
    this.dialogRef.close(this.location);
  }
}
