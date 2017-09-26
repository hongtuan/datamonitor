import { Injectable }                             from '@angular/core';
import { Headers, Http,RequestOptions,Response }  from '@angular/http';
import { Observable }     from 'rxjs/Observable';

import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ApiWebTesterService {

  private jsonRequestOptions = new RequestOptions({
    headers: new Headers({'Content-Type': 'application/json'})
  });

  private extractData(res: Response) {
    //console.log('res=',JSON.stringify(res,null,2));
    let body = res.json();
    return body || {};//must return body,not body.data
  }

  private handleError (error: any) {
    console.log('error=',JSON.stringify(error,null,2));
    let errMsg = `call ${error.url} res: ${error.status} - ${error.statusText}`;
    /*
    var errBody = error.json();
    let errMsg = typeof errBody == 'string'?errBody:errBody.errmsg ? errBody.errmsg :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); //*/
    return Observable.throw(errMsg);
    //return Observable.throw(error);
  }

  constructor(private http: Http) { }

  callGet(url:string):Observable<any> {
    //调用get url
    /*
     .subscribe(res=>{
      console.log('res=',JSON.stringify(res,null,2));
      return res;
    })
     */
    return this.http.get(url)
      .map(this.extractData).catch(this.handleError);
  }

  callPost(url:string,reqData:any):Observable<any> {
    //调用Post url
    return this.http.post(url,reqData, this.jsonRequestOptions)
      .map(this.extractData).catch(this.handleError);
  }

  callPut(url:string,reqData:any):Observable<any> {
    //调用Put url
    return this.http.put(url,reqData, this.jsonRequestOptions)
      .map(this.extractData).catch(this.handleError);
  }

  callDelete(url:string):Observable<any> {
    //调用Delete url
    return this.http.delete(url)
      .map(this.extractData).catch(this.handleError);
  }
}
