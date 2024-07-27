
import { Component, OnInit } from '@angular/core';
import { DataSharingService } from '../DataSharingService';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CartService } from '../services/cart.service';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-getOrder',
  templateUrl: './getOrder.component.html',
  styleUrls: ['./getOrder.component.css']
})
export class GetOrderComponent implements OnInit {
  userDetail: any;
  orderList: any[] = [];
  productList: any[] = [];
  userData: any;
  selectedProduct: any;
  updateForm: FormGroup;
  provincesData: any[] = [];
  amphures: any[] = [];
  tambons: any[] = [];
  selecteds: any;

  promprayNumber  = '0826079703';
  linkPrompray: string = '';
  totalPrice: number = 0;

  selected = {
    province_id: undefined as number | undefined,
    amphure_id: undefined as number | undefined,
    tambon_id: undefined as number | undefined
  };

  constructor(
    private dataSharingService: DataSharingService,
    private callService: CallserviceService,
    private sanitizer: DomSanitizer,
    private cartservice: CartService,
    private formBuilder: FormBuilder,
  ) {
    this.updateForm = this.formBuilder.group({
      userId: '',
      address: ['', Validators.required],
      provinceId: ['', Validators.required],
      amphureId: ['', Validators.required],
      tambonId: ['', Validators.required],
      zipcode: ['', Validators.required],
      status: '',
      productId: this.formBuilder.array([]),
      quantity: this.formBuilder.array([])
    });
  }
  // updatePaymentForm = this.formBuilder.group({
  //   ordersId : [],
  //   files : [],
  // });
  ngOnInit(): void {
    this.getData();
  const hasRefreshed = sessionStorage.getItem('hasRefreshed');
  if (!hasRefreshed) {
    sessionStorage.setItem('hasRefreshed', 'true');
    window.location.reload();
  } else {

    sessionStorage.removeItem('hasRefreshed');
  }
    
    this.cartservice.getProduct();
    this.callService.fetchProvinces().subscribe(res => {
      this.provincesData = res;
    });

    this.dataSharingService.userDetail.subscribe(value => {
      const userDetailSession: any = sessionStorage.getItem("userDetail");
      this.userDetail = JSON.parse(userDetailSession);
      if (this.userDetail && this.userDetail.userId) {
        this.fetchOrdersAndProducts(this.userDetail.userId);
      }
    });
  }

  getImage(imageNames: any[], imgList: any[]) {
    for (let imageName of imageNames) {
      this.callService.getPaymentImgBlobThumbnail(imageName.paymentImgName).subscribe((res) => {
        if (res) {
          let objectURL = URL.createObjectURL(res);
          let safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          imgList.push(safeUrl);
        }
      });
    }
  }
  getData() {
    this.linkPrompray = `https://promptpay.io/${this.promprayNumber}/${this.totalPrice}.png`;
    console.log(this.linkPrompray);

  }
  getImageList(imageNames: any[], imgList: any[]) {
    for (let imageName of imageNames) {
      this.callService.getBlobThumbnail(imageName.productImgName).subscribe((res) => {
        if (res) {
          let objectURL = URL.createObjectURL(res);
          let safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          imgList.push(safeUrl);
        }
      });
    }
  }
  
  fetchOrdersAndProducts(userId: number): void {
    
    this.callService.getOrderByUserId(userId).subscribe(res => {
      if (res.status === 'SUCCESS' && res.data && res.data.length > 0) {
        this.orderList = res.data;
        this.orderList.forEach(order => {
    
          this.getUserDetails(order.userId);
        });

        this.callService.getAllPaymentImage().subscribe(
          (data: any) => {
            const paymentImages = data.data;
      
            this.orderList.forEach((order: any) => {
              // กรองภาพการชำระเงินที่ตรงกับ ordersId ใน orderList
              order.paymentImage = paymentImages.filter((payment: any) => order.ordersId === payment.ordersId);
              order.paymentImage.forEach((payment: any) => {
                payment.imgList = [];
                this.callService.getPaymentImgByUserId(payment.ordersId).subscribe((imgRes: any) => {
                  if (imgRes.data) {
                    this.getImage(imgRes.data, payment.imgList);
                  }
                });
                this.onUpload(payment.ordersId);
              });
            });
          },
         
        );

        this.callService.getAllProduct().subscribe((res: any) => {
          if (res.data) {
            const allProducts = res.data;
            this.orderList.forEach((order: any) => {
              order.productList = allProducts.filter((product: any) => order.productId.includes(product.productId));
              order.productList.forEach((product: any) => {
                product.imgList = [];
                this.callService.getProductImgByProductId(product.productId).subscribe((imgRes) => {
                  if (imgRes.data) {
                    this.getImageList(imgRes.data, product.imgList);
                  }
                });
              });
            });
          }
        });
      }
    });
  }

  calculateTotalSum(order: any): number {
    return order.productList.reduce((total: number, product: any) => {
      return total + (product.price * this.getQuantity(order, product.productId));
    }, 0);
  }

  getQuantity(order: any, productId: number): number {
    const productIndex = order.productId.indexOf(productId);
    return productIndex > -1 ? order.quantity[productIndex] : 0;
  }

  onProvinceChange(event: any): void {
    const provinceId = event.target.value ? Number(event.target.value) : undefined;
    this.selected = {
      ...this.selected,
      province_id: provinceId,
      amphure_id: undefined,
      tambon_id: undefined
    };
    this.amphures = [];

    if (provinceId !== undefined) {
      const selectedProvince = this.provincesData.find(province => province.id === provinceId);
      if (selectedProvince && selectedProvince.amphure) {
        this.amphures = selectedProvince.amphure;
      }
    }
  }

  onAmphureChange(event: any): void {
    const amphureId = event.target.value ? Number(event.target.value) : undefined;
    this.selected = {
      ...this.selected,
      amphure_id: amphureId,
      tambon_id: undefined
    };
    this.tambons = [];

    if (amphureId !== undefined) {
      const selectedAmphure = this.amphures.find(amphure => amphure.id === amphureId);
      if (selectedAmphure && selectedAmphure.tambon) {
        this.tambons = selectedAmphure.tambon;
      }
    }
  }

  onTambonChange(event: any): void {
    const tambonId = event.target.value ? Number(event.target.value) : undefined;
    this.selected = {
      ...this.selected,
      tambon_id: tambonId
    };
    const selectedTambon = this.tambons.find(tambon => tambon.id === tambonId);
    const zipCode = selectedTambon ? selectedTambon.zip_code : undefined;

    this.updateForm.patchValue({
      zipcode: zipCode
    });
  }

  getUserDetails(userId: number): void {
    this.callService.getByUserId(userId).subscribe(response => {
      if (response.status === 'SUCCESS') {
        this.userData = response.data;
      }
    });
  }



  onDeleteOrder(ordersId: any) {
    if (ordersId) {
      this.callService.deleteOrder(ordersId).subscribe(res => {
        if (res.data) {
          window.location.reload();
        }
      });
    }
  }

  setDataForm(selectedProduct: any): void {
    this.updateForm.patchValue({
      userId: selectedProduct.userId,
      address: selectedProduct.address,
      provinceId: selectedProduct.provinceId,
      amphureId: selectedProduct.amphureId,
      tambonId: selectedProduct.tambonId,
      zipcode: selectedProduct.zipcode,
      status: selectedProduct.status
    });

    this.updateForm.setControl('productId', this.formBuilder.array(selectedProduct.productId || []));
    this.updateForm.setControl('quantity', this.formBuilder.array(selectedProduct.quantity || []));
  }

  setSelectedProduct(order: any): void {
    this.selectedProduct = order;
    this.setDataForm(order);
  }

  onSubmit(): void {
    const order = this.updateForm.value;

    this.callService.updateOrder(order, this.selectedProduct.ordersId).subscribe(
      res => {
        if (res.data) {
          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ!',
            text: 'แก้ไขข้อมูลสำเร็จ',
            confirmButtonText: 'ตกลง',
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload();
            }
          });
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'บันทึกไม่สำเร็จ!',
            text: 'กรุณาตรวจสอบข้อมูล ด้วยค่ะ',
            confirmButtonText: 'ตกลง',
          });
        }
      },
      error => {
        Swal.fire({
          icon: 'error',
          title: 'ข้อผิดพลาด!',
          text: 'เกิดข้อผิดพลาดในการส่งข้อมูล',
          confirmButtonText: 'ตกลง',
        });
      }
    );
  }
  setSelecteds(payment: any) {
    this.selecteds = payment;
  }

 
  selectedFiles: File[] = [];
  ordersId: number | undefined;

  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }

  deleteImage(fileName: string): void {
    if (fileName) {
      this.callService.deletePaymentImage(fileName).subscribe(
        response => {
          Swal.fire({
            icon: 'success',
            title: 'Image Deleted',
            text: 'Image deleted successfully',
            confirmButtonText: 'OK'
          }).then(() => {
            this.refreshData();
          });
        },
        error => {
          Swal.fire({
            icon: 'error',
            title: 'Delete Error',
            text: 'Error deleting image',
            confirmButtonText: 'OK'
          });
        }
      );
    }
  }


  onUpload(ordersId: any): void {
    if (this.selectedFiles.length > 0 && ordersId !== undefined) {
      const formData = new FormData();
      for (const file of this.selectedFiles) {
        formData.append('file', file, file.name);
      }

      this.callService.savePaymentImgUserId(formData, ordersId).subscribe(response => {
        if (response.status === 'SUCCESS') {
          Swal.fire({
            icon: 'success',
            title: 'อัพโหลดสำเร็จ!',
            text: 'รูปภาพถูกอัพโหลดเรียบร้อยแล้ว',
            confirmButtonText: 'ตกลง'
          }).then(() => {
          
            this.refreshData();
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'อัพโหลดไม่สำเร็จ!',
            text: 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ',
            confirmButtonText: 'ตกลง'
          });
        }
      }, );
    } 
  }
  refreshData(): void {
    this.callService.getAllPaymentImage().subscribe(
      (data: any) => {
        const paymentImages = data.data;
  
        this.orderList.forEach((order: any) => {
          // Filter payment images that match ordersId in orderList
          order.paymentImage = paymentImages.filter((payment: any) => order.ordersId === payment.ordersId);
          order.paymentImage.forEach((payment: any) => {
            payment.imgList = [];
            this.callService.getPaymentImgByUserId(payment.ordersId).subscribe((imgRes: any) => {
              if (imgRes.data) {
                this.getImage(imgRes.data, payment.imgList);
              }
            });
          });
        });
      },
    );
  }
 
  }


