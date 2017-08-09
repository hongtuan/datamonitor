import { AfterViewInit,Component, ViewEncapsulation,OnInit } from '@angular/core';
import {FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router }                 from '@angular/router';

import { UserService }            from './user.svc';
import { AuthService }            from '../../services/auth.service';
import { User }                   from './user.mdl';

@Component({
  selector: 'login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  encapsulation: ViewEncapsulation.None
})
export class Login implements AfterViewInit, OnInit {

  public form:FormGroup;
  public email:AbstractControl;
  public password:AbstractControl;
  public submitted:boolean = false;
  
  private user: User;
  private token: string;
  private errMsg: string;

  constructor(fb:FormBuilder,private router: Router,
    private userService:UserService,private authService:AuthService) {
    this.user = {_id:null,email:'',name:'',password:'',hash:'',salt:''};
    
    this.form = fb.group({
      'email': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
    });

    this.email = this.form.controls['email'];
    this.password = this.form.controls['password'];
    //console.log('Login constructor run over.');
  }

  //*
  public onSubmit(values:Object):void {
    this.submitted = true;
    if (this.form.valid) {
      // your code goes here
      //console.log(values);
      this.user.email = this.email.value;
      this.user.password = this.password.value;
    }
    
    //console.log('user='+JSON.stringify(this.user));
    //
    this.userService.login(this.user).subscribe(
      loginRes => {
        //console.log('user='+JSON.stringify(loginRes));
        this.token = loginRes.token;
        //console.log('this.token='+this.token);
        this.authService.login(this.token);
        //var payload = JSON.parse(window.atob(this.token.split('.')[1]));
        var tokenInLocalStorage = this.authService.getToken();
        //console.log('tokenInLocalStorage='+tokenInLocalStorage);
        var payload = JSON.parse(window.atob(tokenInLocalStorage.split('.')[1]));
        var userInfo =  {
          email : payload.email,
          name : payload.name,
          role : payload.role,
          loclist : payload.loclist,
        };

        var tmpStr = `User ${userInfo.name} login success.`;
        layer.msg(tmpStr);
        //jump to default route:
        this.router.navigate( ['/pages/location']);
      },
      error =>{
        console.log('login faild:'+JSON.stringify(error));
        this.errMsg = <any>error;
        layer.msg('login faild:'+this.errMsg);
      }
    );
    //console.log('Login onSubmit run over.');
  }//*/

  ngOnInit(): void {
    //auto login before user logout.
    if(this.authService.isUserLogin()){
      //console.log('auto login...');
      this.authService.login(null);
      let link = ['/pages/location'];
      this.router.navigate(link);
      //console.log('auto login over.');
    }
  }
  
  ngAfterViewInit() {
    //console.log('In ngAfterViewInit() authService.isLoggedIn='+this.authService.isLoggedIn);
    //console.log('LoginFormComponent:ngAfterViewInit() called.');
    //console.log('Login ngAfterViewInit run over.');
  }
}
