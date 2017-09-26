import { Component } 					from '@angular/core';
import { Router,ActivatedRoute }  		from '@angular/router';
import { AuthService }            		from '../../services/auth.service';
import { ApiWebTesterService }   from '../../services/apiwebtester.service';

@Component({
  selector: 'apiwebtester-form',
  templateUrl: './apiwebtester.component.html',
  //styleUrls: ['./xxx.component.css']
})
export class ApiWebTesterComponent {
  title = 'apiTester';
  apiUrl:string = '/api/sysinfo';
  methods: any[] = [
    {
      desc: 'Get',
      type: 'GET'
    },
    {
      desc: 'Post',
      type: 'POST'
    },
    {
      desc: 'Put',
      type: 'PUT'
    },
    {
      desc: 'Delete',
      type: 'DELETE'
    },
  ];
  selectedMethod:string = 'GET';
  reqData:string = JSON.stringify({"key":"value"},null,2);
  resData:string = '';

  constructor(private route: ActivatedRoute,private router: Router,
	private apiwebtesterService: ApiWebTesterService,
	private authService:AuthService) {
	  //console.log('ApiWebTesterComponent constructor calle.');
  }

	showJSON(jsonObj:any):string{
	  return JSON.stringify(jsonObj,null,2);
	}

  doTest():void{
    var logInfo = `call ${this.apiUrl} with ${this.selectedMethod} method...\n`;
    //console.log(logInfo);
    this.resData = logInfo;
    var reqDataObj = JSON.parse(this.reqData);
    //console.log('reqDataObj=',reqDataObj,JSON.stringify(reqDataObj,null,2));
    switch(this.selectedMethod) {
      case 'GET':
        //console.log('call GET method  here.');
        this.apiwebtesterService.callGet(this.apiUrl).subscribe(
          resData =>{
            //console.log('resData:',JSON.stringify(resData,null,2));
            //console.log('resData!!',resData);
            this.resData += JSON.stringify(resData,null,2);
          },
          error =>{
            //console.log('error:',error,JSON.stringify(error,null,2));
            //console.log('error!!',error);
            this.resData = error;
          }
        );
        break;
      case 'POST':
        //console.log('call POST method  here.');
        this.apiwebtesterService.callPost(this.apiUrl,reqDataObj).subscribe(
          resData =>{
            this.resData += JSON.stringify(resData,null,2);
          },
          error =>{
            //console.log('error:',error);
            this.resData += error;
          }
        );
        break;
      case 'PUT':
        //console.log('call PUT method  here.');
        this.apiwebtesterService.callPut(this.apiUrl,reqDataObj).subscribe(
          resData =>{
            this.resData += JSON.stringify(resData,null,2);
          },
          error =>{
            //console.log('error:',error);
            this.resData += error;
          }
        );
        break;
      case 'DELETE':
        //console.log('call DELETE method  here.');
        this.apiwebtesterService.callDelete(this.apiUrl).subscribe(
          resData =>{
            this.resData += JSON.stringify(resData,null,2);
          },
          error =>{
            //console.log('error:',error);
            this.resData += error;
          }
        );
    }
  }
}
