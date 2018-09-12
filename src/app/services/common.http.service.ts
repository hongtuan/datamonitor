import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
// import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class CommonHttpService {

  private jsonRequestOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };

  constructor(private http: HttpClient) {
  }

  callGet(url: string, success: Function, failed: Function): void {
    // 调用get url
    this.http.get<any>(url).subscribe(
      resData => {if (success) success(resData)},
      error => {if (failed) failed(error)}
    );
  }

  callPost(url: string, reqData: any, success: Function, failed: Function): void {
    // 调用Post url
    this.http.post<any>(url, {doc: reqData}, this.jsonRequestOptions).subscribe(
      resData => {if (success) success(resData)},
      error => {if (failed) failed(error)}
    );
  }

  callPut(url: string, reqData: any, success: Function, failed: Function): void {
    // 调用Put url
    this.http.put<any>(url, {doc: reqData}, this.jsonRequestOptions).subscribe(
      resData => {if (success) success(resData)},
      error => {if (failed) failed(error)}
    );
  }

  callDelete(url: string, success: Function, failed: Function): void {
    // 调用Delete url
    this.http.delete<any>(url).subscribe(
      resData => {if (success) success(resData)},
      error => {if (failed) failed(error)}
    );
  }
}
