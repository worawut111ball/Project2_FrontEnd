import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { DataSharingService } from '../DataSharingService';
import { CallserviceService } from '../services/callservice.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(
    private formBuilider: FormBuilder,
    private callService: CallserviceService,
    private router: Router,
    private dataSharingService: DataSharingService,
    private cartservice: CartService
  ) { }

  ngOnInit() {
    sessionStorage.removeItem("userDetail");
  }

  loginForm = this.formBuilider.group({
    userName: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  onSubmit() {
    const userName = this.loginForm.value.userName;
    const password = this.loginForm.value.password;
    this.callService.authen(userName, password).subscribe(res => {
      console.log(res);
      if (res.data) {
        
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'เข้าสู่ระบบสำเร็จจ้า',
          confirmButtonText: 'ตกลง',
        });

        sessionStorage.setItem("userDetail", JSON.stringify(res.data));
        this.dataSharingService.userDetail.next(true);
        this.cartservice.loadCartData();

        this.router.navigate(['/']).then(() => {
          window.location.reload();
        });

      } else {
        Swal.fire({
          icon: 'warning',
          title: 'เข้าสู่ระบบไม่สำเร็จ!',
          text: 'กรุณาตรวจสอบข้อมูลด้วยจ้า',
          confirmButtonText: 'ตกลง',
        });
      }
    });
  }

}
