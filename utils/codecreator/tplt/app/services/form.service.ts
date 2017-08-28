import { Injectable }                             from '@angular/core';
import { Headers, Http,RequestOptions,Response }  from '@angular/http';

import { Observable }     from 'rxjs/Observable';

import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


@Injectable()
export class ___ComponentName___Service {

  //private headers = new Headers({'Content-Type': 'application/json'});
  private jsonRequestOptions = new RequestOptions({
    headers: new Headers({'Content-Type': 'application/json'})
  });

  private extractData(res: Response) {
    //console.log('res='+JSON.stringify(res));
    let body = res.json();
    //if(body)
    //  console.log('res_body='+JSON.stringify(body));
    return body || {};//must return body,not body.data
  }

  private handleError (error: any) {
    //console.log('error='+JSON.stringify(error));
    //console.log('body='+JSON.stringify(error.json()));
    var errBody = error.json();
    //console.log('errBody='+JSON.stringify(errBody));
    let errMsg = typeof errBody == 'string'?errBody:errBody.errmsg ? errBody.errmsg :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }

  private apiUrl = '/api/hospitals/';  // URL to web api
  private getHisUrl = '/api/userhislist/';  // URL to web api

  constructor(private http: Http) { }

  getHospitals(userInfo:any): Observable<any[]> {
    //需要按用户过滤列表.
    return this.http.post(this.getHisUrl,userInfo,this.jsonRequestOptions)
      .map(this.extractData).catch(this.handleError);
  }

  addHospital(formData:any,userInfo:any):Observable<any> {
    var dataPkg = {model:formData,userInfo:userInfo};
    return this.http.post(this.apiUrl,dataPkg, this.jsonRequestOptions)
      .map(this.extractData).catch(this.handleError);
  }

  updateHospital(formData:any):Observable<any> {
    return this.http.put(this.apiUrl+'edit/'+formData._id,
      formData, this.jsonRequestOptions)
      .map(this.extractData).catch(this.handleError);
  }

  deleteHospital(hid:string):Observable<any> {
    //console.log('ng:hid='+hid);
    return this.http.delete(this.apiUrl+hid)
      .map(this.extractData).catch(this.handleError);
  }
}
