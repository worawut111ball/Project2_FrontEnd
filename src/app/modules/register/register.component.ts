
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CallserviceService } from '../services/callservice.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(
    private callService: CallserviceService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activated: ActivatedRoute
  ) { }

  roleList: any = [];
  isPassword: boolean = false;

  ngOnInit() {
    this.getAllRole();
  }

  registerForm = this.formBuilder.group({
    fristName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: ['', Validators.required],
    age: ['', Validators.required],
    // roleId: ['', Validators.required],
    userName: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(4)]],
    confirmPassword: ['', Validators.required]
  }, { validator: this.passwordMatchValidator });

  getAllRole() {
    this.callService.getAllRole().subscribe(res => {
      if (res) {
        this.roleList = res;
      }
    });
  }

  onSubmit() {
    this.isPassword = false;
    if (this.registerForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบ!',
        text: 'กรุณากรอกข้อมูลให้ครบทุกช่อง',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    if (this.passwordValidate()) {
      const data = this.registerForm.value;
      Swal.fire({
        title: 'ต้องการสมัครสมาชิก?',
        text: "คุณต้องการสมัครสมาชิกใช่หรือไม่!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#56C596',
        cancelButtonColor: '#d33',
        confirmButtonText: 'บันทึก',
        cancelButtonText: 'ยกเลิก'
      }).then((result) => {
        if (result.isConfirmed) {
          this.callService.saveRegister(data).subscribe(res => {
            if (res.data) {
              Swal.fire({
                icon: 'success',
                title: 'สำเร็จ!',
                text: 'สมัครสมาชิกสำเร็จ',
                confirmButtonText: 'ตกลง',
              }).then(ress => {
                this.router.navigate(['/login']);
              });
            } else {
              Swal.fire({
                icon: 'warning',
                title: 'บันทึกไม่สำเร็จ!',
                text: 'กรุณาตรวจสอบข้อมูล ด้วยค่ะ',
                confirmButtonText: 'ตกลง',
              });
            }
          });
        }
      });
    }
  }

  passwordValidate() {
    const password = this.registerForm.value.password;
    const confirmPassword = this.registerForm.value.confirmPassword;

    if (password !== confirmPassword) {
      this.isPassword = true;
      return false;
    } else {
      return true;
    }
  }

  passwordMatchValidator(form: any) {
    const password = form.get('password').value;
    const confirmPassword = form.get('confirmPassword').value;

    return password === confirmPassword ? null : { 'mismatch': true };
  }
}
