import { Component } 					from '@angular/core';
import { Router,ActivatedRoute }  		from '@angular/router';
import { AuthService }            		from '../../services/auth.service';
import { ___ComponentName___Service }   from '../../services/___componentFileNamePre___.service';

@Component({
  selector: '___componentFileNamePre___-form',
  templateUrl: './___componentFileNamePre___.component.html',
  //styleUrls: ['./xxx.component.css']
})
export class ___ComponentName___Component {
  title = 'apiTester';
  apiUrl:string;
  constructor(private route: ActivatedRoute,private router: Router,
	private ___componentFileNamePre___Service: ___ComponentName___Service,
	private authService:AuthService) {
	  //console.log('___ComponentName___Component constructor calle.');
  }
  
  doTest():void{
    console.log('log');
  }
}
