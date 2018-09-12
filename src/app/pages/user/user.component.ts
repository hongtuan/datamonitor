import { Component } from '@angular/core';
import { Router }   from '@angular/router';
import { MatDialog } from '@angular/material';

import { User }             from '../../domain/user.mdl';
import { UserService }      from '../../services/user.service';
import { UserDialogForm }   from './components/user.dialog.form';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AssignLocationComponent } from './components/assign.location';

const DlgConfig = {
  disableClose:true,
  hasBackdrop:true,
  width:'600px',
  height:'300px'
};

@Component({
  selector: 'user',
  templateUrl: 'user.component.html',
  styles: [
    `.clkt {
      cursor: pointer;
    }
    #listPanel{
      min-height:360px;
    }
    `
  ]
})

export class UserComponent {
  users:User[];
  private errMsg: string;

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private userService:UserService,
    public dialog: MatDialog) {

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
    let dialogRef = this.dialog.open(UserDialogForm,//null);
      _.assign({}, DlgConfig,{data:formData}));
    /*
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });//*/
  }
  assignLocation(user:any) {
    if(user.role === 'root'){
      layer.msg('root user do not need assign locations.');
      return;
    }
    const modalRef = this.modalService.open(
      AssignLocationComponent,
      { centered: true,backdrop:'static' });
    modalRef.componentInstance.setSavedLocationList(user.loclist);
    modalRef.componentInstance.setUserId(user._id);
    //fill back locid
    modalRef.result.then(loclist=>{
      //console.log('loclist=',loclist);
      user.loclist = loclist;
    });
  }
}
