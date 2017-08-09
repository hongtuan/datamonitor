import { Component, OnInit, ViewChild  } from '@angular/core';
import { Router,ActivatedRoute }   from '@angular/router';
import { MdDialog } from '@angular/material';

import { User }             from '../../domain/user.mdl';
import { UserService }      from '../../services/user.service';
import { UserDialogForm }   from './components/user.dialog.form';

var DlgConfig = {
  disableClose:true,
  hasBackdrop:true,
  width:'680px',
  height:'520px'
};

@Component({
  selector: 'user',
  templateUrl: 'user.component.html',
  styles: [
    `.clkt {
      cursor: pointer;
    }`
  ]
})

export class UserComponent {
  users:User[];
  private errMsg: string;

  constructor(private router: Router,
    private userService:UserService,
    public dialog: MdDialog) {
      
  }

  getUsers(): void {
    this.userService.getUsers().subscribe(
      users => {
        this.users = users;
      },
      errMsg => this.errMsg = errMsg
    );
  }
  
  ngOnInit(): void {
    this.getUsers();
  }

  onUserAdded(user: User):void {
    this.users.unshift(user);
  }

  onUserDeleted(uid: string):void {
    this.users = this.users.filter(function(user){
      return user._id != uid;
    });
  }

  deleteUser(uid:string):void {
    layerHelper.confirm('Are you sure to delete this Record?', 
      'Delete Confirm',
      (index) => {
      this.userService.deleteUser(uid).subscribe(res=>{
        if(res == 'success'){
          layer.msg('delete success.');
          this.onUserDeleted(uid);
        }else{
          layer.msg('delete failed:'+res);
        }
      },
      errMsg => {
        console.error(errMsg);
      });
    });
  }
  
  openAddDlg():void {
    let dialogRef = this.dialog.open(UserDialogForm,DlgConfig);
    dialogRef.afterClosed().subscribe(user => {
      //console.log('user=',JSON.stringify(user,null,2));
      if(user!=''){
        this.users.unshift(user);
      }
    });
  }

  openEditDlg(formData:any):void {
    let dialogRef = this.dialog.open(UserDialogForm,
      $.extend({}, DlgConfig,{data:formData}));
    /*
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });//*/
  }
}

