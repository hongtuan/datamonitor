import { Injectable }    from '@angular/core';
import { Headers, Http,RequestOptions,Response } from '@angular/http';

import { Observable }     from 'rxjs/Observable';

import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
//import 'rxjs/add/operator/toPromise';



@Injectable()
export class NodeDataService {
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
    let errMsg = errBody.message ? errBody.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }

  constructor(private http: Http) { }
  
  getRawData(url:string):Observable<any> {
    return this.http.get(url)
      .map(this.extractData).catch(this.handleError);
  }
  
  getLocationData(lid:string):Observable<any> {
    let url = `/api/locations/${lid}/ld`;
    //console.log('url=',url);
    return this.http.get(url)
      .map(this.extractData).catch(this.handleError);
  }

  saveNodeData(dataPkg:any):Observable<any> {
    let saveDataUrl = '/api/nd/savend';
    return this.http.post(saveDataUrl,dataPkg,this.jsonRequestOptions)
      .map(this.extractData).catch(this.handleError);
  }
  
  saveMockNodeData(dataPkg:any):Observable<any> {
    let saveDataUrl = 'http://xsentry.co/api/v1/sentry/C47F51001099/snapshots';
    return this.http.post(saveDataUrl,dataPkg,this.jsonRequestOptions)
      .map(this.extractData).catch(this.handleError);
  }
}
