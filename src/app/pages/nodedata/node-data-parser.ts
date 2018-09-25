//our root app component
import { Component, OnInit }     from '@angular/core'
import { ActivatedRoute, Router} from '@angular/router';
import { NodeDataService }          from '../../services/node-data.service';
import { CommonHttpService } from '../../services/common.http.service';
import { HttpClient, HttpRequest, HttpEvent, HttpEventType, HttpErrorResponse}  from '@angular/common/http';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbProgressbarExt } from './ngb.progressbar.ext';
// import * as moment from "moment";
// import * as _ from "lodash";
// import { throwError } from "rxjs";
// import { map, tap, last,catchError } from "rxjs/operators";

@Component({
  selector: 'node-data-parser',
  templateUrl:'node-data-parser.html',
  styles:[
    `.full-width {
      width: 100%;
    }`
  ]
})
export class NodeDataParserComponent implements OnInit {
  //readonly defaultUrl:string = 'http://xsentry.co/api/v1/sentry/C47F51001099/snapshots?top=3';
  dataUrl:string = '';
  datasrc:string = '';
  snapcount:number = 3;
  timeGap:number = 1;
  name:string = '';
  lid:string;
  locationData:any;
  constructor(
    private modalService: NgbModal,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private _httpClient: HttpClient,
    private httpClient: CommonHttpService,
    private nodeDataService:NodeDataService) {
    //console.log('NodeDataParserComponent:constructor called.');
  }
  ngOnInit(): void {
    let params = this.activatedRoute.snapshot.params;
    this.lid = params['lid'];
    this.datasrc = params['src'];
    this.snapcount = params['sc'];
    this.name = params['name'];
    // console.log('name',JSON.stringify(this.name,null,2));

    this.nodeDataService.getLocationData(this.lid).subscribe(
      locationData => {
        this.locationData = locationData;
        this.getRawData();
        //console.log('',JSON.stringify(this.locationData,null,2));
      },
      errMsg => {
        this.errMsg = errMsg;
        console.error(this.errMsg);
      }
    );
  }

  analysisResult:any = {
    rawData:{obj:null,str:'',desc:''},
    pastNodeData:{obj:null,str:'',desc:'',cObj:null},
    newNodeData:{obj:null,str:'',desc:'',cObj:null},
    // dataTimeInfo:{latestDataTime:null,latestDataNid:'',oldestDataTime:null,oldestDataNid:''},
    noDataNode:{obj:null,str:'',desc:''}
  };

  nidTimeMap:any = {};
  nidList:string[] = [];
  /**
   * find which nid has not assigned.
   * find which tag has no data.
   */
  analysisResultDesc:string = '';

  errMsg: string;

  getRawData():void {
    let url = dataParser.buildDataUrl(this.datasrc,this.snapcount);
    //layer.load();
    let lwi = layer.load();
    //*
    this.nodeDataService.getRawData(url).subscribe(
      rawData => {

        this.analysisResult.rawData.obj = rawData;
        let totalCount = 0;
        this.analysisResult.rawData.str = '';
        _.each(rawData,(item)=>{
          this.analysisResult.rawData.str+=`[${item.sentryId}]@${dataParser.iso2Locale(item.timestamp)},has ${item.nodes.length} items\n`;
          totalCount += item.nodes.length;
        });
        this.analysisResult.rawData.desc = ` ${rawData.length} snapshots,has ${totalCount} nodes.`;

        let pastDataList = dataParser.getPastData(
          rawData,
          this.timeGap,
          (classifiedData)=>{
            this.analysisResult.pastNodeData.cObj = classifiedData;
          }
        );
        this.analysisResult.pastNodeData.obj = pastDataList;
        this.analysisResult.pastNodeData.desc = ` ${pastDataList.length} nodes.`;
        this.updatePastDataOrder('time');


        let newDataList = dataParser.getNewData(
          rawData,
          (classifiedData)=>{
            this.analysisResult.newNodeData.cObj = classifiedData;
            this.nidList = _.keys(classifiedData);
            _.each(classifiedData, (dl, nid)=>{
              this.nidTimeMap[nid] = dl[dl.length-1]['timestampISO'];
            });
          }
        );
        this.analysisResult.newNodeData.obj = newDataList;
        this.analysisResult.newNodeData.desc = ` ${newDataList.length} nodes.`;
        const od = newDataList[0],ld = newDataList[newDataList.length -1];
        this.analysisResult.newNodeData.str = `[${od.nid}]@(${this.getNodeTag(od.nid)}) sent the oldest data on ${dataParser.iso2Locale(od.timestampISO)}\n`;
        this.analysisResult.newNodeData.str += `[${ld.nid}]@(${this.getNodeTag(ld.nid)}) sent the latest data on ${dataParser.iso2Locale(ld.timestampISO)}\n\n`;

        _.each(newDataList, (item)=>{
          this.analysisResult.newNodeData.str += `[${item.nid}]@(${this.getNodeTag(item.nid)}) latestData on ${dataParser.iso2Locale(item.timestampISO)}\n`;
        });

        //find Unassigned Mac here:
        const unassignedNodes = [];
        for(let nid of this.nidList){
          let node = this.locationData.NNM[nid];
          if(node === undefined)
            unassignedNodes.push({nid:nid,dataTime:this.nidTimeMap[nid]});
          //this.analysisResult += `UnassignedMac[${nid}]@${du.iso2Locale(this.nidTimeMap[nid])}`;
        }
        if(unassignedNodes.length>0){
          //du.sortArrayByAttr(unassignedNodes,'dataTime','desc');
          let tmpStr = '';
          unassignedNodes.forEach((un)=>{
            tmpStr += `Mac[${un.nid}]@${dataParser.iso2Locale(un.dataTime)}\n`
          });
          this.analysisResultDesc += `\nThere are ${unassignedNodes.length} Unassigned Mac:\n`;
          this.analysisResultDesc += tmpStr;
        }else{
          this.analysisResultDesc += 'all mac has been assigned.';
        }

        //find no data node here:
        let noDataNodeList = [];
        _.each(this.locationData.NNM, (tag, nid)=>{
          if(!this.nidList.includes(nid)){
            noDataNodeList.push(`[${nid}]@(${tag.ptag})`);
          }
        });
        if(noDataNodeList.length > 0){
          this.analysisResultDesc += `\nThere are ${noDataNodeList.length} nodes has no data.\n`;
          this.analysisResultDesc += noDataNodeList.join('\n');
        }else{
          this.analysisResultDesc += 'all node has data in these snapshots.';
        }

        layer.close(lwi);
      },
      errMsg => this.errMsg = errMsg
    );
  }

  getNodeTag(nid):string{
    const node = this.locationData.NNM[nid];
    return node?node.ptag:'Unassigned';
  }


  getBack():void {
    this.router.navigate(['/pages/location']);
  }

  pastDataOrderBy = 'nid';

  updatePastDataOrder(orderBy): void{
    if(this.pastDataOrderBy!=orderBy){
      //*
      let lwi = layer.load();
      this.pastDataOrderBy=orderBy;
      switch (this.pastDataOrderBy) {
        case 'time':
          const od = this.analysisResult.pastNodeData.obj[0];
          const ld = this.analysisResult.pastNodeData.obj[this.analysisResult.pastNodeData.obj.length -1];
          this.analysisResult.pastNodeData.str = `[${od.nid}]@(${this.getNodeTag(od.nid)}) sent the oldest data on ${dataParser.iso2Locale(od.timestampISO)}\n`;
          this.analysisResult.pastNodeData.str += `[${ld.nid}]@(${this.getNodeTag(ld.nid)}) sent the latest data on ${dataParser.iso2Locale(ld.timestampISO)}\n\n`;
          _.each(this.analysisResult.pastNodeData.obj, (item)=>{
            this.analysisResult.pastNodeData.str += `[${item.nid}]@(${this.getNodeTag(item.nid)}) sent data on ${dataParser.iso2Locale(item.timestampISO)}\n`;
          });
          break;
        case  'nid':
          this.analysisResult.pastNodeData.str = '';
          _.each(this.analysisResult.pastNodeData.cObj, (item, nid)=>{
            let sortedItem:any = _.sortBy(item,['timestampISO']);
            this.analysisResult.pastNodeData.str += `[${nid}]@(${this.getNodeTag(nid)}) has ${item.length} datas,dataTime in range:[${dataParser.iso2Locale(sortedItem[0].timestampISO)} ~ ${dataParser.iso2Locale(sortedItem[sortedItem.length - 1].timestampISO)}]\n`;
            if(item.length>1){
              _.each(sortedItem,(si)=>{
                this.analysisResult.pastNodeData.str += `[${nid}]@(${this.getNodeTag(nid)}) sent data on ${dataParser.iso2Locale(si.timestampISO)}\n`;
              });
            }
          });
          break;
      }
      layer.close(lwi);//*/
    }
  }

  savePastNodeData():void {
    //confirm save.
    //*
    layerHelper.confirm('Do you want to save the past data to DB?','SaveConfirm',()=>{
      // get a modalRef here.
      const modalRef = this.modalService.open(
        NgbProgressbarExt, { centered: true,backdrop:'static' });
      // get progressBar here.
      const progressBar = modalRef.componentInstance;
      // set longTask name.
      progressBar.setTaskName(this.lid);
      progressBar.showProgressDesc = true;
      // call long task here.
      this.httpClient.callLongTask(
        `/api/nd/${this.lid}/save`,
        this.analysisResult.pastNodeData.cObj,
        {
          uploadStart: () => {
            progressBar.updateProgressInfo(20,'upload...');
            progressBar.setProgressDesc('sending data to server now...');
          },
          updateTaskInfo: (ufValue)=>{
            // console.log('ufValue=',ufValue);
            progressBar.updateProgressInfo(ufValue,ufValue+'% uploaded.');
            progressBar.setProgressDesc('sending data to server over.');
            if (ufValue == 100) {
              progressBar.startRefreshProgress();
            }
          },
          finishTask: (result) => {
            const _result = result.body;
            //console.log(_result);
            //layer.close(lwi);
            let saveResult = '';
            if(_result['new']>0){
              saveResult += `find unsaved past data,just saved ${_result['new']} items.\n`;
            }else {
              saveResult += 'no unsaved past data find,increase the snapshotsCount value and click Refresh button,then save again.\n ';
            }
            saveResult += JSON.stringify(_result,null,2);
            layerHelper.showInfo(saveResult);
          },
          handleError: (error)=>{
            console.log('handleError:',error);
          }
        }
      );
    });
  }

  showRawData():string {
    return `${this.analysisResult.rawData.str}the raw data detail are:\n${JSON.stringify(this.analysisResult.rawData.obj,null,2)}`;
  }
}
