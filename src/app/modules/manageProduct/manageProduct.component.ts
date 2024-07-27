

import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DataSharingService } from '../DataSharingService';
import Swal from 'sweetalert2';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-manageProduct',
  templateUrl: './manageProduct.component.html',
  styleUrls: ['./manageProduct.component.css']
})
export class ManageProductComponent implements OnInit {

  constructor(
    private callService : CallserviceService,
    private sanitizer: DomSanitizer,
    private router : Router,
    private dataSharingService: DataSharingService,
    private cartservice: CartService,
    
  ) { 
  }
  userDetail : any
  imageBlobUrl : any 
  imageBlobUrls : any = []
  productImgList : any
  productList : any
  productTypeList : any= []
  ngOnInit() {
    this.getProductTypeAll();

    this.cartservice.getProduct()
    
    this.callService.getAllProduct().subscribe(res=>{
      
      if(res.data){
        this.productList = res.data
        for(let product of this.productList){
          product.imgList = []

          product.productType = this.productTypeList.filter((x : any)  => x.productTypeId == product.productTypeId);
          if(null == product.productType[0]){
            window.location.reload()
          }

          this.callService.getProductImgByProductId(product.productId).subscribe((res) => {
            if(res.data){
              this.productImgList = res.data
              for(let productImg of this.productImgList){
                this.getImage(productImg.productImgName, product.imgList);
              }
            }else{
              window.location.reload()
            }
          });
          this.dataSharingService.userDetail.subscribe( value => {
            var userDetailSession : any = sessionStorage.getItem("userDetail")
            this.userDetail = JSON.parse(userDetailSession)
        });
        }
      }
    }) 

    var userDetailSession : any = sessionStorage.getItem("userDetail")
    this.userDetail = JSON.parse(userDetailSession)
  }
 

  getImage(fileNames : any ,  imgList : any){
    this.callService.getBlobThumbnail(fileNames).subscribe((res) => {
        let objectURL = URL.createObjectURL(res);       
        this.imageBlobUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        imgList.push(this.imageBlobUrl)
    });
  }

  getProductTypeAll(){
    this.callService.getProductTypeAll().subscribe((res) => {
      if(res.data){
        this.productTypeList = res.data
      }
    });
  }

  async onDeleteProduct(productId: any): Promise<void> {
        if (!productId) return;
    
        const result = await Swal.fire({
          title: 'ต้องการลบสินค้า?',
          text: 'คุณต้องการลบสินค้าใช่หรือไม่!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#56C596',
          cancelButtonColor: '#d33',
          confirmButtonText: 'บันทึก',
          cancelButtonText: 'ยกเลิก'
        });
    
        if (result.isConfirmed) {
          try {
            const res = await this.callService.deleteProduct(productId).toPromise();
            if (res.data) {
              await Swal.fire({
                icon: 'success',
                title: 'ลบสำเร็จ!',
                text: 'ลบสินค้าสำเร็จ',
                confirmButtonText: 'ตกลง'
              });
              this.reloadComponent();
            } else {
              await Swal.fire({
                icon: 'warning',
                title: 'ลบไม่สำเร็จ!',
                text: 'กรุณาตรวจสอบข้อมูล ด้วยค่ะ',
                confirmButtonText: 'ตกลง'
              });
            }
          } catch (error) {
            await Swal.fire({
              icon: 'error',
              title: 'เกิดข้อผิดพลาด!',
              text: 'ไม่สามารถลบลบสินค้า กรุณาลองใหม่อีกครั้ง',
              confirmButtonText: 'ตกลง'
            });
          }
        }
      }

  onUpdateProduct(productId : any){
    this.router.navigate(['/product/'+ productId]);
  }
 
  private reloadComponent(): void {
        this.router.navigate(['/manage-product']).then(() => {
          window.location.reload();
        });
      }
    }

