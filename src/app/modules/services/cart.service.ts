import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataSharingService } from '../DataSharingService';
import { environment } from 'src/environments/environment';
import { HttpHeaders } from '@angular/common/http';

const API_ENDPOINT = environment.API_ENDPOINT;
const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'accept': '*/*' }) };
const httpOptionsMultipart = { headers: new HttpHeaders({ 'Content-Type': 'multipart/form-data', 'accept': '*/*' }) };
const httpOptionsText = { headers: new HttpHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }) };
@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemList: any[] = [];
  public productList = new BehaviorSubject<any[]>([]);
  private cartKey = 'cartData';


  constructor( private dataSharingService: DataSharingService,) { 
    this.loadCartData();
  }

  getProduct() {
    return this.productList.asObservable();
  }

  setProduct(products: any[]) {
    this.cartItemList.push(...products);
    this.productList.next(this.cartItemList);
    this.saveCartData();
  }

  // addToCart(product: any) {
  //   this.cartItemList.push(product);
  //   this.productList.next(this.cartItemList);
  //   this.getTotalPrice(); 
  //   this.saveCartData();
  //   console.log(this.cartItemList);
  // }
  removeAllCartItems() {
    this.cartItemList = [];
    this.productList.next(this.cartItemList);
    this.saveCartData();
  }
  addtoCart(product: any) {
    const existingProduct = this.getCartItemById(product.productId);
    if (existingProduct) {
      // ถ้าสินค้ามีอยู่แล้วในรถเข็น ให้เพิ่มจำนวนสินค้า
      existingProduct.quantity += 1;
      this.updateCartItem(existingProduct);
    } else {
      // ถ้าสินค้าไม่มีในรถเข็น ให้เพิ่มเป็นรายการใหม่
      this.cartItemList.push({ ...product, quantity: 1 });
      this.productList.next(this.cartItemList);
      this.saveCartData();
    }
    this.getTotalPrice(); // This function doesn't need to return anything since it's just calculating total internally
    console.log(this.cartItemList);
  }
  updateCartItem(updatedItem: any): void {
    const itemIndex = this.cartItemList.findIndex((item: any) => item.productId === updatedItem.productId);

    if (itemIndex > -1) {
      this.cartItemList[itemIndex] = updatedItem;
      this.productList.next(this.cartItemList);
      this.saveCartData();
    }
  }
  getCartItemById(productId: any): any {
    return this.cartItemList.find((item: any) => item.productId === productId);
  }
  getTotalPrice() {
    let grandTotal = 0;
    this.cartItemList.forEach(item => {
      grandTotal += item.price;
    });
    return grandTotal;
  }

  removeCartItem(productIdToRemove: any) {
    this.cartItemList = this.cartItemList.filter(item => item.productId !== productIdToRemove);
    this.productList.next(this.cartItemList);
    this.saveCartData();
  }

 
  // private saveCartData() {
  //   var userDetailSession : any = sessionStorage.getItem("userDetail")
  //   const userDetail = JSON.parse(userDetailSession)
  //   console.log("userDetail",userDetail);
  //   let key=this.cartKey
  //   if(null!=userDetail){
  //     key=userDetail.userName+this.cartKey
  //   }
  //   console.log(key);
  //   localStorage.setItem( key, JSON.stringify(this.cartItemList));
  //   this.dataSharingService.cartNumber.next(this.cartItemList.length);
    
  // }
  public saveCartData() {
    var userDetailSession : any = sessionStorage.getItem("userDetail")
    const userDetail = JSON.parse(userDetailSession)
    console.log("userDetail",userDetail);
    let key=this.cartKey
    if(null!=userDetail){
      key=userDetail.userName+this.cartKey
    }
    console.log(key);
    localStorage.setItem( key, JSON.stringify(this.cartItemList));
    this.dataSharingService.cartNumber.next(this.cartItemList.length);
  }

 loadCartData() {
    var userDetailSession : any = sessionStorage.getItem("userDetail")
    const userDetail = JSON.parse(userDetailSession)
    console.log("LoadCartData",userDetail);
    let key=this.cartKey
    if(null!=userDetail){
      key=userDetail.userName+this.cartKey
    }
    console.log("UserName",key);
    const savedCart = localStorage.getItem(key);
    if (savedCart) {
      this.cartItemList = JSON.parse(savedCart);
      this.productList.next(this.cartItemList);
      this.dataSharingService.cartNumber.next(this.cartItemList.length);
    }
  
  }


}
