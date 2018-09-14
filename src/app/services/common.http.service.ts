import {Injectable} from '@angular/core';
import {HttpClient, HttpEventType, HttpHeaders, HttpRequest} from '@angular/common/http';
// import {Observable} from 'rxjs/Observable';
// import 'rxjs/add/observable/throw';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/catch';

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

  /**
   * 调用长耗时服务的方法，内部默认按post方式调用。
   * @param url 服务url
   * @param reqData 向服务发生的数据
   * @param callback 一组回调方法
   * {
   *   uploadStart: Function,     // 上传开始时的回调
   *   updateTaskInfo: Function,  // 常时任务执行过程中更新进度条的回调
   *   finishTask: Function,      // 常时任务执行完成的回调
   *   handleError: Function,     // 错误处理回调
   * }
   */
  callLongTask(url: string, reqData: any, callback: any):void {
    // build a HttpRequest obj.
    const req = new HttpRequest('POST', url,
      {doc: reqData},
      {reportProgress: true}
    );
    // call request here.
    this.http.request(req).subscribe(result => {
      switch (result.type) {
        case HttpEventType.Sent:
          if (callback.uploadStart) {
            callback.uploadStart();
          }
          break;
        case HttpEventType.UploadProgress:
          // Compute and show the % done:
          // console.log('result=',JSON.stringify(result));
          const ufValue = Math.round(100 * result.loaded / result.total);
          if (callback.updateTaskInfo) {
            callback.updateTaskInfo(ufValue);
          }
          break;
        case HttpEventType.Response:
          if (callback.finishTask) {
            callback.finishTask(result);
          }
          break;
        default:
          //console.log(result.type, 'default');
          break;
      }
      //console.log(result.type,result);
    }, error => {
      console.error(error);
      if (callback.handleError) {
        callback.handleError(error);
      }
    });
  }
}
