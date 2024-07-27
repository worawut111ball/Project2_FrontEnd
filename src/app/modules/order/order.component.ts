
import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { DataSharingService } from '../DataSharingService';
import { CartService } from '../services/cart.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

interface Product {
  productId: number;
  productName: string;
  productDesc: string;
  price: number;
  quantity: number;
  imgList: string[];
  productTypeId: number;
}
declare var bootstrap: any;
@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  userData: any;
  orderData: any;
  provincesData: any[] = [];
  productList: Product[] = [];
  productTypeList: any[] = [];
  userDetail: any;
  totalPrice: number = 0;
  selectedFiles: File[] = [];
  delFile: any[] = [];
  updateForms: FormGroup;
  selectedProduct: any;
  paymentMethod: string = '';

  promprayNumber  = '0826079703';
  linkPrompray: string = '';

  ordersId: number | undefined;

  constructor(
    private callService: CallserviceService,
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private dataSharingService: DataSharingService,
    private cartservice: CartService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { 
    this.updateForms = this.formBuilder.group({
    userId: '',
    address: '',
    provinceId: '',
    amphureId: '',
    tambonId: '',
    zipcode: '',
    status: '',
    productId: this.formBuilder.array([]),
    quantity: this.formBuilder.array([])
  });
}

  updateProductForm = this.formBuilder.group({
    productName: '',
    productDesc: '',
    price: parseFloat('0').toFixed(2),
    quantity: 0,
    productTypeId: '',
    files: [],
    productId: ''
  });

  ngOnInit(): void {
    this.getData();
    
    this.activatedRoute.queryParams.subscribe(params => { 
      if (params['responseData']) {
        // const ordersId = +params['responseData'];
        this.ordersId = Number(params['responseData'])
        this.getOrderId(this.ordersId);
      } else {
        console.error('No responseData in queryParams');
      }
    });

    this.getProductTypeAll();
    this.cartservice.getProduct();
    this.fetchProvincesData();

    this.dataSharingService.userDetail.subscribe((userDetail: any) => {
      this.userDetail = userDetail;
    });
  }

  getOrderId(orderId: number): void {

    this.callService.getOrderById(orderId).subscribe(
      response => {
        if (response.status === 'SUCCESS') {
          this.orderData = response.data;
          this.getUserDetails(this.orderData.userId);
          this.getAllProducts();

          this.setDataForms(this.orderData);
       
        }
      },
    );
  }

  getAllProducts(): void {
    this.callService.getAllProduct().subscribe(
      (res: any) => {
        if (res.data) {
          this.productList = res.data.filter((product: any) => this.orderData.productId.includes(product.productId));
          this.productList.forEach(product => {
            product.imgList = [];
            this.callService.getProductImgByProductId(product.productId).subscribe(
              (imgRes) => {
                if (imgRes.data) {
                  this.getImageList(imgRes.data, product.imgList);
                }
              },
            );
          });
          this.calculateTotalPrice();
        }
      },
    );
  }

  getUserDetails(userId: number): void {
    this.callService.getByUserId(userId).subscribe(
      response => {
        if (response.status === 'SUCCESS') {
          this.userData = response.data;
        }
      },
    );
  }

  getProductTypeAll(): void {
    this.callService.getProductTypeAll().subscribe(
      (res: any) => {
        if (res.data) {
          this.productTypeList = res.data;
        }
      },
    );
  }

  getImageList(imageNames: any[], imgList: any[]): void {
    imageNames.forEach(imageName => {
      this.callService.getBlobThumbnail(imageName.productImgName).subscribe(
        (res) => {
          if (res) {
            const objectURL = URL.createObjectURL(res);
            const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            imgList.push(safeUrl);
          }
        },
      );
    });
  }

  fetchProvincesData(): void {
    this.callService.fetchProvinces().subscribe(
      response => {
        this.provincesData = response;
      },
    );
  }

  calculateTotalPrice(): void {
    this.totalPrice = this.productList.reduce((acc, product) => {
      const index = this.orderData.productId.indexOf(product.productId);
      if (index !== -1) {
        return acc + (product.price * this.orderData.quantity[index]);
      }
      return acc;
    }, 0);
    console.log(this.totalPrice);
    this.getData();
  }
  getData() {
    this.linkPrompray = `https://promptpay.io/${this.promprayNumber}/${this.totalPrice}.png`;
    console.log(this.linkPrompray);

  }

  onDeleteOrder(ordersId: any): void {
    if (ordersId) {
      this.callService.deleteOrder(ordersId).subscribe(res => {
        if (res.data) {
          this.router.navigate(['/']);
        }
      });
    }
  }
  setDataForms(orderData: any): void {

    this.updateForms.patchValue({
      userId: orderData.userId,
      address: orderData.address,
      provinceId: orderData.provinceId,
      amphureId: orderData.amphureId,
      tambonId: orderData.tambonId,
      zipcode: orderData.zipcode,
       status: "5"
    });
   
    this.updateForms.setControl('productId', this.formBuilder.array(orderData.productId || []));
    this.updateForms.setControl('quantity', this.formBuilder.array(orderData.quantity || []));
  
  }

  prepareAndSubmit(): void {
    const orderData = this.updateForms.value;
    console.log("ข้อมูลที่ส่งออกไป2:", orderData);

    // ตรวจสอบค่าก่อนส่ง
    if (!orderData.userId) {
      console.error('UserId is null or undefined');
      return;
    }

    this.callService.updateOrder(orderData, this.orderData.ordersId).subscribe(
      res => {
        // console.log('Response:', res);
        if (res.data) {
          this.getOrderId(this.orderData.ordersId);
        }
      },
    );
  
  
    this.productList.forEach((product) => {
      const index = this.orderData.productId.indexOf(product.productId);
      if (index !== -1) {
        product.quantity -= this.orderData.quantity[index];
      }
      this.setDataForm(product);
  
      const data = this.updateProductForm.value;
      console.log("ข้อมูลที่ส่งออกไป:", data); // Log the data being sent
  
      this.callService.updateProduct(data, data.productId).subscribe(res => {
   
  
        if (res.data) {
          if (this.delFile) {
            for (let fileName of this.delFile) {
              this.callService.deleteImage(fileName).subscribe(() => {
                console.log("Deleted image:", fileName);
              });
            }
          }
          if (this.selectedFiles.length > 0) {
            for (const file of this.selectedFiles) {
              const formData = new FormData();
              formData.append('file', file);
              this.callService.saveImage(formData, res.data).subscribe(res => {
                console.log("Uploaded image:", res.data);
              });
            }
          }
          if (res.data) {
            Swal.fire({
              icon: 'success',
              title: 'สำเร็จ!',
              text: 'บันทึกข้อมูลสำเร็จ',
              confirmButtonText: 'ตกลง'
            }).then(res => {
              if (res.isConfirmed) {
                this.router.navigate(['/get-all-order']);
              }
            });
          } else {
            Swal.fire({
              icon: 'warning',
              title: 'บันทึกไม่สำเร็จ!',
              text: 'กรุณาตรวจสอบข้อมูล ด้วยค่ะ',
              confirmButtonText: 'ตกลง'
            });
          }
        }
      });
    });
  }
  
  

  setDataForm(data: any): void {
    this.updateProductForm.patchValue({
      productName: data.productName,
      productDesc: data.productDesc,
      price: data.price,
      quantity: data.quantity,
      productTypeId: data.productTypeId,
      productId: data.productId
    });
  }

  // Open modal method
  openModal(): void {
    const modalElement = document.getElementById('paymentModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  setPaymentMethod(method: string) {
    this.paymentMethod = method;
  }
  confirmPayment() {
    // Logic สำหรับการยืนยันการชำระเงินปลายทาง
    // อาจจะมีการบันทึกคำสั่งซื้อ หรือเปลี่ยนสถานะคำสั่งซื้อ
    console.log('ยืนยันการชำระเงินปลายทาง');
    // Redirect ไปหน้าหลัก
    this.router.navigate(['/get-order']);
  }

  // Handle file selection
  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }
  

 
  onUpload(): void {
    if (this.selectedFiles.length > 0 && this.ordersId !== undefined) {
      const formData = new FormData();
      for (const file of this.selectedFiles) {
        formData.append('file', file, file.name); // เปลี่ยนจาก 'files' เป็น 'file'
      }
      console.log('Uploading files:', this.selectedFiles); // Log ข้อมูลไฟล์ที่กำลังจะส่ง
      console.log('Order ID:', this.ordersId); // Log Order ID ที่กำลังจะใช้

      this.callService.savePaymentImgUserId(formData, this.ordersId).subscribe(response => {
        if (response.status === 'SUCCESS') {
          Swal.fire({
            icon: 'success',
            title: 'อัพโหลดสำเร็จ!',
            text: 'รูปภาพถูกอัพโหลดเรียบร้อยแล้ว',
            confirmButtonText: 'ตกลง'
          }).then(() => {
            this.router.navigate(['/get-order']);
          
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'อัพโหลดไม่สำเร็จ!',
            text: 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ',
            confirmButtonText: 'ตกลง'
          });
        }
      }, error => {
        console.error('Error uploading image:', error);
        Swal.fire({
          icon: 'error',
            title: 'อัพโหลดไม่สำเร็จ!',
            text: 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ',
            confirmButtonText: 'ตกลง'
        });
      });
    } else {
      console.error('Order ID is undefined or no files selected');
      Swal.fire({
        icon: 'error',
        title: 'อัพโหลดไม่สำเร็จ!',
        text: 'Order ID is undefined or no files selected',
        confirmButtonText: 'ตกลง'
      });
    }
  }

}

