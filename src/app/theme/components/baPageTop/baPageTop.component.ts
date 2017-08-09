//import {Component} from '@angular/core';
import { Component, OnInit }   from '@angular/core';
import { Router }                 from '@angular/router';
import { Subscription }           from 'rxjs/Subscription';

import { AuthService }    from '../../../services/auth.service';

import {GlobalState} from '../../../global.state';

@Component({
  selector: 'ba-page-top',
  inputs: ['loginStatus'],
  templateUrl: './baPageTop.html',
  styleUrls: ['./baPageTop.scss']
})
export class BaPageTop implements OnInit {
  
  
  isLogin:boolean = false;
  userName:string = '';
  isRoot:boolean = false;

  loginStatus:string;

  public isScrolled:boolean = false;
  public isMenuCollapsed:boolean = false;

  constructor(private _state:GlobalState,
              private router: Router,
              private authService:AuthService) {
    this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
      this.isMenuCollapsed = isCollapsed;
    });
    //console.log('BaPageTop:constructor() called.');
  }
              
  ngOnInit() {
    //console.log('this.loginStatus:',this.loginStatus);
    if(this.loginStatus === this.authService.hasLogIn){
      this.isLogin = true;
      var userInfo = this.authService.getUserInfo();
      this.userName = userInfo.name;
      this.isRoot = userInfo.role == 'root';
    }else{
      this.isLogin = false;
      this.isRoot = false;
    }
    //console.log('BaPageTop:ngOnInit() call over.',this.isLogin);
  }

  public toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
    this._state.notifyDataChanged('menu.isCollapsed', this.isMenuCollapsed);
    return false;
  }

  public scrolledChanged(isScrolled) {
    this.isScrolled = isScrolled;
  }
  

  isUserLoginOk() : boolean {
    return this.isLogin;
  }

  logOut():void {
    //give a confirm here:
    layerHelper.confirm('Are you sure to logout?','Logout Confirm',() => {
      this.authService.logOut();
    });
    //console.log('logout over.');
  }
}
