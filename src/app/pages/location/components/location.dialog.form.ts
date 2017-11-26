import { Component, Inject, OnInit,AfterViewInit } from '@angular/core';
import * as GoogleMapsLoader from 'google-maps';
import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material';

import { Location }             from '../../../domain/location.mdl';
import { DlgMode }              from '../../../domain/definitions';

import { LocationService }  from '../../../services/location.service';
import { AuthService }      from '../../../services/auth.service';


@Component({
  selector: 'location-dialog-form',
  templateUrl: 'location.dialog.form.html',
  styles: [
    `.dlgheader {
      height: 24px;
      margin: 0;
    }
    .dlgbody {
      width: 540px;
      height: 315px;
      border: solid 1px #e4e5e7;
      margin: 5px 5px 10px 5px;
    }
    .dlgfooter {
      height: 24px;
      margin: 0;
    }
    .pdf {
      margin: 0;
    }
    .mdci{margin-bottom: 10px;}                      
    .full-width {
      width: 100%;
    }
    .shortipt{width:240px;}
    .radioipt{width:200px;height: 24px}
    .apname{width:20px}
    .apdesc{width:120px}
    .aprange{width:50px}
    .google-maps{
      height:0px;
    }
    `
  ]
})
export class LocationDialogForm implements OnInit,AfterViewInit {
  location:Location;
  //alertPolicyStr:string;

  defaultAlertPolicy = [
    {name:'SS',desc:'Signal Strength',range:{min:20,max:150}},
    {name:'SC',desc:'Super Cap Voltage',range:{min:2.4,max:3.6},step:0.1},
    {name:'AH',desc:'Ambient Humidity',range:{min:45,max:45}},
    {name:'RH',desc:'Roof Humidity',range:{min:40,max:90}},
    {name:'DH',desc:'Delta Humidity',range:{min:-15,max:0}},
    {name:'TP',desc:'Temperature',range:{min:60,max:80}},
    {name:'FS',desc:'Fan Speed',range:{min:1,max:1}},
    {name:'FC',desc:'FanCounts',range:{min:0,max:0}},
    {name:'FD',desc:'FanData',range:{min:0,max:0}}
  ];

  dlgTitle:string = 'AddLocation';
  searchType:string = 'establishment';
  autocomplete:any;

  private dlgMode:DlgMode = DlgMode.Add;

  constructor(@Inject(MD_DIALOG_DATA) public data: any,
    public dialogRef: MdDialogRef<LocationDialogForm>,
    private locationService: LocationService,
    private authService:AuthService) {
    this.location = new Location({name:'',address:'',contactInfo:'',emails:'',
    datasrc:'C47F51016BAC',snapcount:30,synperiod:600,monitperiod:600,alertPolicy:this.defaultAlertPolicy});
    //this.alertPolicyStr = JSON.stringify(this.defaultAlertPolicy,null,2);
    //console.log('LocationDialogForm:constructor() called.');
  }

  ngOnInit(): void {
    if(this.data){
      //console.log(JSON.stringify(this.data,null,2));
      this.dlgMode = DlgMode.Edit;
      this.location = this.data;
      //this.alertPolicyStr = JSON.stringify(this.location.alertPolicy,null,2);
      this.dlgTitle = 'EditLocation';
    }
    //console.log('LocationDialogForm:constructor() called.');
  }

  switchSearchType(st){
    //console.log(st);
    this.autocomplete.setTypes([st]);
    console.log('now search for ',st);
  }


  ngAfterViewInit() {
    if(this.dlgMode == DlgMode.Edit) {
      console.log('edit mode,do not need auto search.');
      return;
    }

    GoogleMapsLoader.KEY = 'AIzaSyACXZwCraYGZB_15hN6Ml1UmYAKDLHTBik';//Tim's Key.
    GoogleMapsLoader.LIBRARIES = ['geometry', 'places'];
    GoogleMapsLoader.LANGUAGE = 'en';

    // TODO: do not load this each time as we already have the library after first attempt
    GoogleMapsLoader.load((google) => {
      var searchBox = document.getElementById('address');
      this.autocomplete = new google.maps.places.Autocomplete(searchBox);
      this.autocomplete.setTypes([this.searchType]);
      google.maps.event.addListener(this.autocomplete, 'place_changed', () => {
        var place = this.autocomplete.getPlace();
        var address = place.formatted_address;
        var lat = place.geometry.location.lat();
        var lng = place.geometry.location.lng();
        var msg = `Address:${address},lat:${lat},lng:${lng}`;
        searchBox.setAttribute("value", address);
        var lat_lng = `${lat},${lng}`;
        this.location.ctpos = lat_lng;
        this.location.gwpos = lat_lng;
        this.location.address = address;
        //console.log(msg);//

      });
    });
    //console.log('LocationDialogForm ngAfterViewInit called.');
  }

  closeDlg():void {
    this.dialogRef.close(this.location);
  }
  getAlertPolicyConfig():any{
    var alertPolicy = [];
    this.defaultAlertPolicy.forEach(function (ap) {
      alertPolicy.push({name:ap.name,desc:ap.desc,
        range:{min:$("#"+ap.name+"_min").val(),max:$("#"+ap.name+"_max").val()}});
    });
    return alertPolicy;
  }

  onSubmit():void {
    //console.log('1.location=',this.location);
    //this.location.alertPolicy = JSON.parse(this.alertPolicyStr);
    this.location.alertPolicy = this.getAlertPolicyConfig();
    //console.log('2.location=',this.location);
    if(this.dlgMode == DlgMode.Add){
      //var alertPolicy = this.getAlertPolicyConfig();
      //console.log(alertPolicy);
      //*
      //console.log('do add task.');
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
      );//*/
    }
    if(this.dlgMode == DlgMode.Edit){
      //console.log('do edit task.');
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
