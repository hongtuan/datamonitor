import { Injectable }                             from '@angular/core';
import { Headers, Http,RequestOptions,Response }  from '@angular/http';

import { Observable }     from 'rxjs/Observable';

import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


@Injectable()
export class alertlogviewerService {

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

  private apiUrl = '/api/al';  // URL to web api

  constructor(private http: Http) { }

  getAlertLogs(lid:string,limit:Number): Observable<any[]> {
    //
    var url = `${this.apiUrl}/${lid}/${limit||100}`;
    //console.log(url);
    return this.http.get(url)
      .map(this.extractData).catch(this.handleError);
  }

}
