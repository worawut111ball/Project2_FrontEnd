import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DataSharingService } from '../DataSharingService';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  

  constructor(
    private callService: CallserviceService,
    private sanitizer: DomSanitizer,
    private dataSharingService: DataSharingService,
    private router: Router,
    private cartService: CartService
  ) { }

  userDetail: any;
  productList: any;
  productTypeList: any = [];
  imageBlobUrl: any;
  imageBlobUrls: any = [];
  productImgList: any;
  selectedProduct: any;

  ngOnInit(): void {
    this.getProductTypeAll();

    this.callService.getAllProduct().subscribe(res => {
      if (res.data) {
        this.productList = res.data;
        for (let product of this.productList) {
          product.imgList = [];
          product.productType = this.productTypeList.filter((x: any) => x.productTypeId == product.productTypeId);
          if (!product.productType[0]) {
            window.location.reload();
          }

          this.callService.getProductImgByProductId(product.productId).subscribe((res) => {
            if (res.data) {
              this.getImageList(res.data, product.imgList);
            } else {
              window.location.reload();
            }
          });
        }

        this.dataSharingService.userDetail.subscribe(value => {
          const userDetailSession: any = sessionStorage.getItem("userDetail");
          this.userDetail = JSON.parse(userDetailSession);
        });
      }
    });
  }

  // async addToCart(productId: any): Promise<void> {
  //   await this.cartService.addToCart(productId); }

  // async addtoCart(productId: any): Promise<void> {
  //   try {
  //     this.setSelectedProduct(productId);
  //     const existingProduct = this.cartService.getCartItemById(productId);
  
  //     if (existingProduct) {
  //       // ถ้าสินค้ามีอยู่แล้วในรถเข็น ให้เพิ่มจำนวนสินค้า
  //       existingProduct.quantity += 1;
  //       await this.cartService.updateCartItem(existingProduct);
  //     } else {
  //       // ถ้าสินค้าไม่มีในรถเข็น ให้เพิ่มเป็นรายการใหม่
  //       await this.cartService.addtoCart(productId);
  //     }
  //   } catch (error) {
  //     console.error('Error adding to cart:', error);
  //     // จัดการข้อผิดพลาดที่เกิดขึ้นที่นี่
  //   } finally {
  //     // โค้ดที่ควรทำงานเสมอไม่ว่าจะเกิดข้อผิดพลาดหรือไม่ก็ตาม
  //   }
  // }
  async addtoCart(productId: any): Promise<void> {
    try {
      this.setSelectedProduct(productId);
      const existingProduct = this.cartService.getCartItemById(productId);
  
      if (existingProduct) {
        // ถ้าสินค้ามีอยู่แล้วในรถเข็น ให้เพิ่มจำนวนสินค้า
        existingProduct.quantity += 1;
        await this.cartService.updateCartItem(existingProduct);
      } else {
        // ถ้าสินค้าไม่มีในรถเข็น ให้เพิ่มเป็นรายการใหม่
        await this.cartService.addtoCart(productId);
      }
  
      // แสดงข้อความแจ้งเตือนเมื่อเพิ่มสินค้าในรถเข็นสำเร็จ
      Swal.fire({
        icon: 'success',
        title: 'สั่งซื้อสำเร็จ!',
        text: 'ยืนยันการสั่งซื้อสำเร็จ.',
        confirmButtonText: 'ตกลง'
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      // จัดการข้อผิดพลาดที่เกิดขึ้นที่นี่
    } finally {
      // โค้ดที่ควรทำงานเสมอไม่ว่าจะเกิดข้อผิดพลาดหรือไม่ก็ตาม
    }
  }
  
  

  getImageList(imageNames: any[], imgList: any) {
    for (let imageName of imageNames) {
      this.callService.getBlobThumbnail(imageName.productImgName).subscribe((res) => {
        let objectURL = URL.createObjectURL(res);
        this.imageBlobUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        imgList.push(this.imageBlobUrl);
      });
    }
  }

  getProductTypeAll() {
    this.callService.getProductTypeAll().subscribe((res) => {
      if (res.data) {
        this.productTypeList = res.data;
      }
    });
  }

  async onCart(productId: any) {
    if (productId) {
      const result = await Swal.fire({
        icon: 'success',
        title: 'คุณต้องเข้าสู่ระบบก่อน ค่อยซื้อสินค้าได้?',
        text: 'คุณต้องการเข้าสู่ระบบใช่หรือไม่!',
        showCancelButton: true, // เปิดใช้งานปุ่มยกเลิก
        confirmButtonColor: '#56C596',
        cancelButtonColor: '#d33',
        confirmButtonText: 'เข้าสู่ระบบ',
        cancelButtonText: 'ยกเลิก',
      });
      if (result.isConfirmed) {
        this.router.navigate(['/login']);
      }
    }
  }

  setSelectedProduct(product: any) {
    this.selectedProduct = product;
  }
}
