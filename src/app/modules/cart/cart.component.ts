
import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

interface CartItem {
  productId: number;
  productTypeId: number;
  productName: string;
  productDesc: string;
  price: number;
  imgList: { key: string, value: string }[];
  quantity: number;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  public selectedProduct: any;
  public formData: FormGroup;

  totalItem: number = 0;
  public productId: number[] = [];
 
  public quantity: number [] = [];

  public productList: CartItem[] = [];
  public grandTotal: number = 0;
  public imageBlobUrl: any;

  public provinces: any[] = [];
  public amphures: any[] = [];
  public tambons: any[] = [];

  userId : any
  title : any
  userDetail : any

  selected = {
    province_id: undefined as number | undefined,
    amphure_id: undefined as number | undefined,
    tambon_id: undefined as number | undefined
  };

  constructor(
    private cartservice: CartService,
    private callService: CallserviceService,
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private activated: ActivatedRoute,
    private router: Router
  ) {
    this.formData = this.formBuilder.group({
      userId: '',
      address: ['', Validators.required],
      provinceId: ['', Validators.required],
      amphureId: ['', Validators.required],
      tambonId: ['', Validators.required],
      zipcode: ['', Validators.required],
      productId: [],
      quantity: []
    });

    
  }


  ngOnInit(): void {
   
   
    this.cartservice.getProduct().subscribe(res => {
        this.productList = res;
        // .map((item: any) => ({ ...item, quantity: 1 }));
        console.log("productListCart", this.productList);
        for (let product of this.productList) {
          this.callService.getProductImgByProductId(product.productId).subscribe((res) => {
            if (res.data) {
              product.imgList = [];
              this.getImageList(res.data, product.imgList);
            } else {
              window.location.reload();
            }
          });
        }
        this.updateGrandTotal();
      });
  
    this.callService.fetchProvinces()
      .subscribe(res => {
        this.provinces = res;
      });
     
    this.userId = this.activated.snapshot.paramMap.get("userId");
    if (this.userId) {
      this.callService.getByUserId(this.userId).subscribe(res => {
        if (res.data) {
          this.title = "Your Profile User";
          this.userDetail = res.data;
          this.formData.patchValue({
            userId: this.userDetail.userId 
          });
        }
      });
    } else {
      let userDetailSession: any = sessionStorage.getItem("userDetail");
      if (userDetailSession) {
        this.userDetail = JSON.parse(userDetailSession);
        this.formData.patchValue({
          userId: this.userDetail.userId 
        });
        console.log("User ID:", this.userDetail.userId);
      } else {
        // Handle case where userDetail is not found in sessionStorage
      }
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

  removeItem(item: CartItem): void {
    
      this.cartservice.removeCartItem(item.productId);
     
      this.productList = this.productList.filter(p => p.productId !== item.productId);
      this.updateGrandTotal();
    
  }
  updateGrandTotal() {
    this.grandTotal = this.productList.reduce((total :any, product:any) => total + (product.price * product.quantity), 0);
  }

  updateTotalItem() {
    this.totalItem = this.productList.reduce((total:any, product:any) => total + product.quantity, 0);
  }
  // decrementQuantity(item: CartItem): void {
  //   if (item.quantity > 1) {
  //     item.quantity--;
  //   } else {
  //     this.removeItem(item);
  //   }
  //   this.updateGrandTotal();
  // }

  // incrementQuantity(item: CartItem): void {
  //   item.quantity++;
  //   this.updateGrandTotal();
  // }
  decrementQuantity(product: any): void {
    if (product.quantity > 1) {
      product.quantity--;
    }
    this.updateGrandTotal();
    this.updateTotalItem(); 
    this.cartservice.saveCartData();
  }

  incrementQuantity(product: any): void {
    product.quantity++;
    this.updateGrandTotal();
    this.updateTotalItem();
   this.cartservice.saveCartData();
  }

  // updateGrandTotal(): void {
  //   this.grandTotal = this.productList.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  // }

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
      const selectedProvince = this.provinces.find(province => province.id === provinceId);
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

    this.formData.patchValue({
      zipcode: zipCode
    });
  }

  onSubmit(): void {


    this.productId = this.productList.map(item => item.productId);
    this.formData.patchValue({ productId: this.productId });
    
    this.quantity = this.productList.map(item => item.quantity);
    this.formData.patchValue({ quantity: this.quantity });
  
    console.log('Form Data:', this.formData.value);
  
    this.callService.saveOrder(this.formData.value).subscribe(
      response => {
        console.log('Form submitted successfully:', response);

        const responseData = response.data; // Extract data from response

        Swal.fire({
          icon: 'success',
          title: 'สั่งซื้อสำเร็จ!',
          text: 'ยืนยันการสั่งซื้อสำเร็จ.',
          confirmButtonText: 'ตกลง'
        }).then((result) => {
          if (result.isConfirmed) {
            const queryParams = {
              responseData: responseData
            };
            this.router.navigate(['/order'], { queryParams });

            // Clear cart items after successful order submission
            this.cartservice.removeAllCartItems();
          }
        });
      },
      error => {
        console.error('Error submitting form:', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด!',
          text: 'เกิดข้อผิดพลาดในการสั่งซื้อ.',
          confirmButtonText: 'ตกลง'
        });
      }
    );
  }
}
