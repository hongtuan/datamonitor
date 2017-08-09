import { Injectable }           from '@angular/core';
import { Subject }              from 'rxjs/Subject';

import { AuthorizationInfo }    from '../domain/definitions';

@Injectable()
export class AuthService {
  private roleAuth:any = {};
  isLoggedIn: boolean = false;
  readonly hasLogIn:string = 'hasLogIn';
  readonly hasLogOut:string = 'hasLogOut';
  // Observable string sources
  private logInStatus = new Subject<string>();
  
  // Observable string streams
  logInStatusAnnounced$ = this.logInStatus.asObservable();
  
  readonly tokenName:string  = 'rsApp-token';
  readonly userInfoKey:string  = 'rsApp-userInfo';

  // store the URL so we can redirect after logging in
  redirectUrl: string;
  constructor(){
    for(let ai of AuthorizationInfo){
      this.roleAuth[ai.value] = ai.authorizedRes; 
    }
  }
  
  public isAuthorized(role,res) :boolean {
    if(role == 'root') return true;
    var ar = this.roleAuth[role];
    if(ar == undefined) return false;
    return ar.includes(res);
  }
  
  saveToken(token):void {
    //store token in localStorage
    window.localStorage[this.tokenName] = token;
    //store userInfo in localStorage also.
    var payload = JSON.parse(window.atob(token.split('.')[1]));
    var userInfo = {
      uid: payload._id,
      email : payload.email,
      name : payload.name,
      role : payload.role,
      loclist : payload.loclist,
    };
    window.localStorage[this.userInfoKey] = JSON.stringify(userInfo);
    //console.log('userInfo='+JSON.stringify(userInfo,null,2));
  }
  
  getToken():string {
    //console.log('getToken()...');
    var token = window.localStorage[this.tokenName];
    return token?token:null;
  }

  isUserLogin():boolean {
    var token = this.getToken();
    return token?true:false;
  }
  
  getLoginStatus():string {
    var token = this.getToken();
    return token?this.hasLogIn:this.hasLogOut;
  }

  getUserInfo():any {
    var userInfo = {};
    var userInfoInLocalStorage = window.localStorage[this.userInfoKey];    
    if(userInfoInLocalStorage) userInfo = JSON.parse(userInfoInLocalStorage);
    //console.log('getUserInfo:'+JSON.stringify(userInfo,null,2));
    return userInfo;
  }

  login(token):void {
    if(token)
      this.saveToken(token);
    this.isLoggedIn = true;
    this.logInStatus.next(this.hasLogIn);//,{role:'view',loclist:['locid01','locid02']});
    //console.log('login over.');
    //this.logInStatus.next(LoginStatus.Login);
  }

  logOut():void {
    window.localStorage.removeItem(this.tokenName);
    window.localStorage.removeItem(this.userInfoKey);
    this.isLoggedIn = false;
    this.logInStatus.next(this.hasLogOut);
    //this.logInStatus.next(LoginStatus.LogOut);
  }
}
