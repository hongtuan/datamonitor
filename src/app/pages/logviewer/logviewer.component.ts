import { Component } 		 from '@angular/core';
import { Router,ActivatedRoute }   from '@angular/router';
import { LogViewerService }  from '../../services/logviewer.service';

@Component({
  selector: 'logviewer-form',
  templateUrl: './logviewer.component.html',
  styles:[
      `.full-width {
      width: 100%;
    }`
  ]
  //styleUrls: ['./xxx.component.css']
})
export class LogViewerComponent {
  files:any[] =[
    {desc:'database',fileKey:'database'},
    {desc:'system',fileKey:'system'},
    {desc:'error',fileKey:'error'},
    {desc:'NginxAccessLog',fileKey:'NginxAccessLog'},
    {desc:'NginxErrorLog',fileKey:'NginxErrorLog'},
  ];
  constructor(private route: ActivatedRoute,private router: Router,
              private logViewerService:LogViewerService) {

  }
  selectedFileKey:string = '';
  fileContent:string;
  apiUrl:string;
  doloadFile():void{
    //console.log('log',this.selectedFileKey);
    var lwi = layer.load();
    if(this.selectedFileKey != ''){
      this.logViewerService.getServerFile(this.selectedFileKey).subscribe(
        fileObj =>{
          this.fileContent = fileObj.fc;
          //console.log('fileContent:',this.fileContent);
          layer.close(lwi);
        },
        error =>{
          layer.close(lwi);
          layer.msg('load data failed.'+error);
          this.fileContent = error;
        }

      );
    }else{
      this.fileContent = 'Please select log type.';
    }
  }
}
