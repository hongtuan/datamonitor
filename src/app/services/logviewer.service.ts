import { Injectable }                             from '@angular/core';
import { Headers, Http,RequestOptions,Response }  from '@angular/http';

import { Observable }     from 'rxjs/Observable';

import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


@Injectable()
export class LogViewerService {

  //private headers = new Headers({'Content-Type': 'application/json'});
  private jsonRequestOptions = new RequestOptions({
    headers: new Headers({'Content-Type': 'application/json'})
  });

  private extractData(res: Response) {
    let body = res.json();
    return body || {};//must return body,not body.data
  }

  private handleError (error: any) {
    var errBody = error.json();
    let errMsg = typeof errBody == 'string'?errBody:errBody.errmsg ? errBody.errmsg :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }

  private apiUrl = '/api/fl';  // URL to web api

  constructor(private http: Http) { }

  getServerFile(fileKey:string): Observable<any> {
    return this.http.get(`${this.apiUrl}?fn=${fileKey}`,this.jsonRequestOptions)
      .map(this.extractData).catch(this.handleError);
  }
}
