import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute }   from '@angular/router';
import { MdDialog } from '@angular/material';

import { Location }               from '../../domain/location.mdl';
import { LocationDialogForm } from './components/location.dialog.form';

import { AuthService }      from '../../services/auth.service';
import { LocationService }  from '../../services/location.service';


var DlgConfig = {
  disableClose:true,
  hasBackdrop:true,
  width:'600px',
  height:'440px',
  panelClass: 'mydlg'
};

@Component({
  selector: 'rs-location',
  templateUrl: 'location.component.html',
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
export class LocationComponent implements OnInit {

  locations: Location[];
  role:string;
  isMonitor:boolean = true;
  selectedLids:string[];
  //selectedLocation: Location;

  constructor(private route: ActivatedRoute,private router: Router,
    private locationService: LocationService,
    private authService:AuthService,
    public dialog: MdDialog) {
    //console.log('LocationComponent constructor calle.');
    //console.log(moment().format('YYYY-MM-DD HH:mm:ss'),'called.');
  }

  getLocations(userInfo:any): void {
    //console.log('getLocations called');
    this.locationService.getLocations(userInfo).subscribe(
      locations =>{
        this.locations = locations;
      },
      error =>{
        layer.msg('load data failed.'+error);
      }
    );
  }

  refreshList():void {
    var userInfo = this.authService.getUserInfo();
    //console.log('userInfo='+JSON.stringify(userInfo,null,2));
    this.role = userInfo.role;
    this.isMonitor = userInfo.role == 'view';
    //console.log('isMonitor='+this.isMonitor);
    this.getLocations(userInfo);
    this.selectedLids = [];
  }

  ngOnInit(): void {
    //console.log('LocationComponent:ngOnInit() called.');
    this.refreshList();
    //console.log('this.isMonitor=',this.isMonitor);
  }

  onLocationDeleted(lid: string) {
    this.locations = this.locations.filter(function(location){
      return location._id != lid;
    });
  }

  deleteLocation(lid:string):void {
    //locMgr.deleteLocation(lid);
    //console.log('cid='+cid);
    layerHelper.confirm('Are you sure to delete this Record?', 'Delete Confirm',
      (index)=>{
      this.locationService.deleteLocation(lid).subscribe(
        delId =>{
          //console.log('delId='+delId);
          this.onLocationDeleted(delId);
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

  deployLocation(location: Location):void {
    if(this.isMonitor) {
      //console.log('isMonitor='+this.isMonitor,'deployLocation jump over.');
      return;
    }
    layerHelper.deployLocation(location._id,location.name);
  }

  monitoringLocation(location: Location):void {
    layerHelper.monitoringLocation(location._id,location.name);
  }

  dataSynMgr(location: Location):void {
    if(this.isMonitor) {
      //console.log('isMonitor='+this.isMonitor,'dataSynMgr jump over.');
      return;
    }
    layerHelper.openDlg('/dm/'+location._id+'/sdmgr',
      location,`${location.name}'s DataSyn Task Management.`,['640px','480px']);
  }

  inspectNode(location: Location):void {
    if(this.isMonitor) {
      //console.log('isMonitor='+this.isMonitor,'inspectNode jump over.');
      return;
    }
    layerHelper.openDlg('/dm/'+location._id+'/in',
      location,`${location.name}'s InspectNode Task Management.`,['380px','560px']);
  }

  viewAlert(location: Location):void {
    if(this.isMonitor) {
      //console.log('isMonitor='+this.isMonitor,'inspectNode jump over.');
      return;
    }
    let link = ['/pages/alv',location._id,location.name];
    this.router.navigate(link);
  }

  goParseData(location: Location):void{
    //console.log('location.datasrc='+location.datasrc);
    if(this.isMonitor) {
      //console.log('isMonitor='+this.isMonitor,'goParseData jump over.');
      return;
    }

    let link = ['/pages/ndp',location._id,location.datasrc,location.snapcount,location.name];
    //console.log('link=',link);

    this.router.navigate(link);
    //console.log('goParseData over.');
  }

  exportLocations():void {
    //console.log('exportLocations here...');
    //console.log(JSON.stringify(this.selectedLids,null,2),this.selectedLids.length);
    if(this.selectedLids.length > 0){
      var url = `/locations/explist/${this.selectedLids.join(',')}`;
      layerHelper.downloadFile(url);
      /*
      $("<iframe/>").attr({
        src: url,
        style: "visibility:hidden;display:none"
      }).appendTo('body');//*/

    }else{
      console.log('selectedLids is empty.');
    }
  }

  selectLocation(lid,ev):void {
    var index = this.selectedLids.indexOf(lid);
    if(ev.target.checked){
      if(index == -1)
        this.selectedLids.push(lid);
    }else{
      if(index != -1)
        this.selectedLids.splice(index, 1);
    }
  }

  selectAll(ev):void {
    if(ev.target.checked){
      $(".lsc").prop("checked",true);
      this.locations.forEach((location)=>{
        var lid = location._id;
        var index = this.selectedLids.indexOf(lid);
        if(index == -1)
          this.selectedLids.push(lid);
      });
    }else{
      $(".lsc").prop("checked",false);
      this.selectedLids.length = 0;
    }
  }

  latestDataOnImg(latestDataOn):string {
    var diffMin = moment().diff(moment(latestDataOn),'minutes');
    //console.log(latestDataOn,diffMin);
    return `/assets/myimgs/${diffMin<=15?'gb':'rb'}.jpg`;
  }

  showLatestDataOn(latestDataOn):string {
    //var diffMin = moment().diff(moment(latestDataOn),'minutes');
    //console.log(latestDataOn,diffMin);
    return moment(latestDataOn).format("YYYY-MM-DD h:mm a");
  }

  openAddDlg():void {
    let dialogRef = this.dialog.open(
      LocationDialogForm,DlgConfig);

    dialogRef.afterClosed().subscribe(result => {
      //console.log(JSON.stringify(result,null,2));
      if(result)
        //this.onLocationAdded.emit(result);
        this.locations.unshift(result);
    });
  }

  openEditDlg(formData:any):void {
    let dialogRef = this.dialog.open(LocationDialogForm,
      $.extend({}, DlgConfig,{data:formData}));

    dialogRef.afterClosed().subscribe(result => {
      //this.selectedOption = result;
      //console.log(`Dialog result: ${result}`);
    });
  }
}

