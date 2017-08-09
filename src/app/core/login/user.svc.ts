import { Injectable }                             from '@angular/core';
import { Headers, Http,RequestOptions,Response }  from '@angular/http';

import { Observable }     from 'rxjs/Observable';

import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
//import 'rxjs/add/operator/toPromise';

import { User } from './user.mdl';

@Injectable()
export class UserService {
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
  
  private usersUrl = '/api/users/';  // URL to web api
  //private usersUrl = 'http://localhost:3000/api/users/';  // URL to web api

  constructor(private http: Http) { }

  getUsers(): Observable<User[]> {
    return this.http.get(this.usersUrl+'userlist')
      .map(this.extractData).catch(this.handleError);
  }
  
  addUser(formData:any): Observable<User> {
    return this.http.post(this.usersUrl+'register',formData, this.jsonRequestOptions)
      .map(this.extractData).catch(this.handleError);
  }

  updateUser(formData:any): Observable<User> {
    return this.http.put(this.usersUrl+'update/'+formData._id,formData, this.jsonRequestOptions)
      .map(this.extractData).catch(this.handleError);
  }

  deleteUser(uid:string):Observable<any> {
    return this.http.delete(this.usersUrl+uid)
      .map(this.extractData).catch(this.handleError);
  }
  
  login(formData:any):Observable<any> {
    return this.http.post(
      this.usersUrl+'login',formData, this.jsonRequestOptions)
      .map(this.extractData)
      .catch(this.handleError);
  }
}
