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
  title = 'apiTester';
  files:any[] =[
	{desc:'forever',fileKey:'forever'},
	{desc:'console',fileKey:'console'},
	{desc:'error',fileKey:'error'},
  ];
  constructor(private route: ActivatedRoute,private router: Router,
	private logViewerService:LogViewerService) {
	
  }
  selectedFileKey:string = '';
  fileContent:string;
  apiUrl:string;
  doloadFile():void{
    //console.log('log',this.selectedFileKey);
    if(this.selectedFileKey != ''){
	    this.logViewerService.getServerFile(this.selectedFileKey).subscribe(
		   fileObj =>{
		       this.fileContent = fileObj.fc;
		       //console.log('fileContent:',this.fileContent);
		     },
		     error =>{
		       layer.msg('load data failed.'+error);
		       this.fileContent = error;
		     }
		   );    	
    }else{
    	this.fileContent = 'Please select log type.';
    }
  }
}
