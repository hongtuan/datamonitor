import { Injectable }                             from '@angular/core';
import { Headers, Http,RequestOptions,Response }  from '@angular/http';

import { Observable }     from 'rxjs/Observable';

import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Location } from '../domain/location.mdl';

@Injectable()
export class LocationService {

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

  private apiUrl = '/api/locations/';  // URL to web api
  //private apiUrl = 'http://127.0.0.1:3000/api/locations/';  // URL to web api
  //private getLocUrl = '/api/userloclist/';  // URL to web api
  //private getLocUrl = 'http://127.0.0.1:3000/api/userloclist/';  // URL to web api

  constructor(private http: Http) { }

  getLocations(userInfo:any): Observable<Location[]> {
    //return this.http.get(this.apiUrl)
    //  .map(this.extractData).catch(this.handleError);
    //console.log('in LocationService:'+
    //      JSON.stringify(userInfo,null,2));
    return this.http.post(`${this.apiUrl}ull`,userInfo,this.jsonRequestOptions)
      .map(this.extractData).catch(this.handleError);
  }

  addLocation(formData:any,userInfo:any):Observable<Location> {
    //console.log(JSON.stringify(formData));
    formData['userInfo'] = userInfo;
    return this.http.post(this.apiUrl+'create',formData, this.jsonRequestOptions)
      .map(this.extractData).catch(this.handleError);
  }

  updateLocation(formData:any):Observable<Location> {
    return this.http.put(this.apiUrl+'edit/'+formData._id,
      formData, this.jsonRequestOptions)
      .map(this.extractData).catch(this.handleError);
  }

  deleteLocation(lid:string):Observable<any> {
    //console.log('ng:lid='+lid);
    return this.http.delete(this.apiUrl+lid)
      .map(this.extractData).catch(this.handleError);
  }
}
