//our root app component
import {  Component,Attribute,OnInit }     from '@angular/core'
import { ActivatedRoute,Params }       from '@angular/router';
import { NodeDataService }          from '../../services/node-data.service';

//var layer;// = require('../lib/layer/layer.js');
//var layer4ng = require('../myjs/layer4ng.js');
//var du = require('../myjs/data_utils.js');

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
  name:string = '';
  lid:string;
  //nidNodeMap:any;
  locationData:any;
  //nidPtagMap:any;
  constructor(private activatedRoute: ActivatedRoute,private nodeDataService:NodeDataService) {
    console.log('NodeDataParserComponent:constructor called.');
  }
  ngOnInit(): void {
    let params = this.activatedRoute.snapshot.params;
    this.lid = params['lid'];
    this.datasrc = params['src'];
    this.snapcount = params['sc'];
    this.name = params['name'];
    console.log('name',JSON.stringify(name,null,2));
    
    this.nodeDataService.getLocationData(this.lid).subscribe(
      locationData => {
        this.locationData = locationData;
        //console.log('',JSON.stringify(this.locationData,null,2));
      },
      errMsg => {
        this.errMsg = errMsg;
        console.error(this.errMsg);
      }
    );
    this.getRawData();
    console.log('NodeDataParserComponent:ngOnInit called.');
  }
  rawData:string = '';
  rawDataStr:string = '';
  rawDataDesc:string = '';
  
  parserData:string = '';
  parserDataDesc:string = '';
  
  analysisResult:string = '';
  
  latestDataTime:string = '';
  latestDataNid:string = '';
  
  oldestDataTime:string = '';
  oldestDataNid:string = '';
  
  nidList:string[] = [];
  simplifiedNodesData:string = '';
  noDataInfo:string = '';
  errMsg: string;
  
  getRawData() :void{
    let url = du.buildDataUrl(this.datasrc,this.snapcount);
    //layer.load();
    var lwi = layer.load();
    this.nodeDataService.getRawData(url).subscribe(
      rawData => {
        //console.log('users='+JSON.stringify(users));
        //console.log(`${rawData.length} raw datas got.`);
        this.rawDataDesc = `${rawData.length} raw datas got.`;
        this.rawDataStr = JSON.stringify(rawData,null,2);
        this.rawData = JSON.stringify(rawData);
        this.parserRawData();
        layer.close(lwi);
      },
      errMsg => this.errMsg = errMsg
    ); 
  }
  
  getNodeTag(nid):string{
    /*
    for(var bname in this.locationData.BNTM){
      var nidTagMap = this.locationData.BNTM[bname];
      var tag = nidTagMap[nid];
      return `${tag?tag:'Unassigned'}[${nid}]`;
    }//*/
    var node = this.locationData.NNM[nid];
    return `${node?node.ptag:'Mac'}[${nid}]`;
  }
  

  nidTimeMap:any;
  parserRawData():void {
    //console.log('this.RawData='+this.rawData);
    if(this.rawData == ''){
      this.parserData = 'please getRawData first.';
      return;
    }
    //console.log('tp='+typeof this.rawData);
    //console.log('this.rawData=\n'+this.rawData);
    //if(typeof this.rawData =='string')
    //  console.log('l='+this.rawData.length());
    var dataArray = JSON.parse(this.rawData);
    var nodesData = du.parserNodes(dataArray);
    if(Array.isArray(nodesData)){
      this.nidTimeMap = {};
      this.nidList = [];
      nodesData.forEach((nd)=>{
        this.nidTimeMap[nd.nid] = nd.timestampISO;
        if(this.latestDataTime == '') {
          this.latestDataTime = nd.timestampISO;
          this.latestDataNid = nd.nid;
        }
        if(nd.timestampISO.localeCompare(this.latestDataTime)>0){
          this.latestDataTime = nd.timestampISO;
          this.latestDataNid = nd.nid;
        }
        if(this.oldestDataTime == '') {
          this.oldestDataTime = nd.timestampISO;
          this.oldestDataNid = nd.nid;
        }
        if(nd.timestampISO.localeCompare(this.oldestDataTime)<0){
          this.oldestDataTime = nd.timestampISO;
          this.oldestDataNid = nd.nid;
        }
        //record the nids 
        if(this.nidList.indexOf(nd.nid) == -1){
          this.nidList.push(nd.nid);
        }
      });
      
      //console.log(`${nidList.length} nid found.`);
      //console.log(nidList.join('\r\n'));
      var rawDataCount = dataArray.length;
      //var str = ''+this.rawData.toString();
      var totalDataLength = this.rawData.length;
      var avgDataLength = Math.ceil(totalDataLength/rawDataCount);
      
      this.analysisResult = `${rawDataCount} raw records,totalLength:${totalDataLength},avgLength:${avgDataLength}\n`;
      this.analysisResult += `${this.getNodeTag(this.latestDataNid)} sent the latestData@${du.iso2Locale(this.latestDataTime)}\n`;
      this.analysisResult += `${this.getNodeTag(this.oldestDataNid)} sent the oldestData@${du.iso2Locale(this.oldestDataTime)}\n`;
      this.analysisResult += `${this.nidList.length} Macs found.\n`;
      
      this.noDataInfo = '';
      var totalNoDataCount = 0;
      var _noDataInfo = [];
      //var isManyArea = this.nidPtagMap.bc>1;
      var isManyArea = this.locationData.BDL.length>1;
      var boundaryNidTagMap = this.locationData.BNTM;
      for(var bname in boundaryNidTagMap){
        //if(bname == 'bc') continue;
        //tmStr += 'area['
        var nidTagMap = boundaryNidTagMap[bname];
        var noDataNodes = [];
        var dataNodes = [];
        for(var nid in nidTagMap){
          var tagInBoundary = nidTagMap[nid];
          if(!this.nidList.includes(nid)){
            noDataNodes.push(`${tagInBoundary}[${nid}]`);
          }
          var ndt = this.nidTimeMap[nid];
          if(ndt){
            dataNodes.push({
              node:`${tagInBoundary}[${nid}]`,
              dataTime:ndt
            });
          }
        }

        //sort here
        du.sortArrayByAttr(dataNodes,'dataTime','desc');
        var nodeInfos = '';
        dataNodes.forEach(function(nd){
          nodeInfos += `${nd.node},@${du.iso2Locale(nd.dataTime)}\n`;
        });
        
        this.analysisResult += `\n${dataNodes.length} Nodes in ${bname} data detail:\n`;
        this.analysisResult += nodeInfos;
        
        
        if(noDataNodes.length>0){
          _noDataInfo.push(`Area[${bname}],has ${noDataNodes.length} no data nodes:`);
          _noDataInfo.push(noDataNodes.join('\n'));
        }
        totalNoDataCount+=noDataNodes.length;
        //boundCount++;
      }
      if(isManyArea)
        this.noDataInfo += `totalNoDataCount:${totalNoDataCount}\n`;
      this.noDataInfo += _noDataInfo.join('\n');
      //find Unassigned Mac here:
      var unassignedNodes = [];
      for(var nid in this.nidTimeMap){
        var node = this.locationData.NNM[nid];
        if(node==undefined)
          unassignedNodes.push({nid:nid,dataTime:this.nidTimeMap[nid]});
          //this.analysisResult += `UnassignedMac[${nid}]@${du.iso2Locale(this.nidTimeMap[nid])}`;
      }
      if(unassignedNodes.length>0){
        du.sortArrayByAttr(unassignedNodes,'dataTime','desc');
        var unassignedNodesInfo = '';
        unassignedNodes.forEach(function(un){
          unassignedNodesInfo += `Mac[${un.nid}]@${du.iso2Locale(un.dataTime)}\n`
        });
        this.analysisResult += `\nThere are ${unassignedNodes.length} Unassigned Mac:\n`;
        this.analysisResult += unassignedNodesInfo;
      }
      
      //test simplifyNodeData
      var simplifiedND = du.simplifyNodesData(nodesData);
      this.simplifiedNodesData = JSON.stringify(simplifiedND,null,2);
      this.simplifiedNodesData += `\n${simplifiedND.length} rows simplifiedNodeData.`
    }
    
    this.parserDataDesc = `${nodesData.length} raw records data parserd.`;
    this.parserData = JSON.stringify(nodesData,null,2);
    console.log('parserRawData over.');
  }
  
  saveNodesData(dataType:string):void{
    console.log('saveNodesData here.dataType='+dataType);
    if(this.parserData == ''){
      layer.msg('need parse data first.');
      return;
    }
    var nodeData = JSON.parse(dataType=='1'?
      this.parserData:this.simplifiedNodesData);
    //call nodeDataService here:
    var dataPkg = {nodeData:nodeData,lid:this.lid};
    this.nodeDataService.saveNodeData(dataPkg).subscribe(
      saveRes => {
        console.log(saveRes);
        //layer.msg(JSON.stringify(saveRes,null,2));
        layer.msg(saveRes.info);
      },
      errMsg => {
        this.errMsg = errMsg;
        console.log('error!'+errMsg);
      }
    );
  }
}
