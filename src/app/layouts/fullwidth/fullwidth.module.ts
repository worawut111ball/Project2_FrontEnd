import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullwidthComponent } from './fullwidth.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { HomeComponent } from 'src/app/modules/home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPermissionsModule } from 'ngx-permissions';
import { NgxLoadingModule } from 'ngx-loading';
import { RegisterComponent } from 'src/app/modules/register/register.component';
import { LoginComponent } from 'src/app/modules/login/login.component';

import { ProfileComponent } from 'src/app/modules/profile/profile.component';
import { ManageUserComponent } from 'src/app/modules/manageUser/manageUser.component';
import { ManageProductComponent } from 'src/app/modules/manageProduct/manageProduct.component';
import { ProductComponent } from 'src/app/modules/product/product.component';
import { UpdateProductComponent } from 'src/app/modules/updateProduct/updateProduct.component';
import { ReportComponent } from 'src/app/modules/report/report.component';
import { CartComponent } from 'src/app/modules/cart/cart.component';
import { QRCodeModule } from 'angularx-qrcode';

import { OrderComponent } from 'src/app/modules/order/order.component';
import { GetOrderComponent } from 'src/app/modules/getOrder/getOrder.component';
import { GetAllOrderComponent } from 'src/app/modules/getAllOrder/getAllOrder.component';



@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    SharedModule,
    FormsModule,
    NgxPermissionsModule.forRoot(),
    ReactiveFormsModule,
    NgxLoadingModule.forRoot({}),
    QRCodeModule
  ],
  declarations: [
    FullwidthComponent,
    HomeComponent,
    RegisterComponent,
    LoginComponent,
    ProfileComponent,
    ManageUserComponent,
    ManageProductComponent,
    ProductComponent,
    UpdateProductComponent,
    ReportComponent,
    CartComponent,
   
    OrderComponent,
    GetOrderComponent,
    GetAllOrderComponent
   
  ]
})
export class FullwidthModule { }
