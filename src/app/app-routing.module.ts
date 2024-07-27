import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultComponent } from './layouts/default/default.component';
import { HomeComponent } from './modules/home/home.component';
import { FullwidthComponent } from './layouts/fullwidth/fullwidth.component';
import { RegisterComponent } from './modules/register/register.component';
import { LoginComponent } from './modules/login/login.component';

import { ProfileComponent } from './modules/profile/profile.component';
import { ManageUserComponent } from './modules/manageUser/manageUser.component';
import { ManageProductComponent } from './modules/manageProduct/manageProduct.component';
import { ProductComponent } from './modules/product/product.component';
import { UpdateProductComponent } from './modules/updateProduct/updateProduct.component';
import { ReportComponent } from './modules/report/report.component';
import { CartComponent } from './modules/cart/cart.component';

import { OrderComponent } from './modules/order/order.component';
import { GetOrderComponent } from './modules/getOrder/getOrder.component';
import { GetAllOrderComponent } from './modules/getAllOrder/getAllOrder.component';




const routes: Routes = [
  {
    path: '',
    component: FullwidthComponent,
    children: [{
      path: '',
      component: HomeComponent
    },{
      path: 'register',
      component: RegisterComponent
    },{
      path: 'login',
      component: LoginComponent
    },{
      path: 'profile',
      component: ProfileComponent
    },{
      path: 'manage-user',
      component: ManageUserComponent
    },{
      path: 'profile/:userId',
      component: ProfileComponent
    },
    
    {path:'',redirectTo:'manage-product',pathMatch:'full'},
    {
      path: 'manage-product',
      component: ManageProductComponent
    },
    
    {
      path: 'product',
      component: ProductComponent
    },{
      path: 'product/:productId',
      component: UpdateProductComponent
    },{
      path: 'report',
      component: ReportComponent
    },{
      path: 'cart',
      component: CartComponent
    },{
      path: 'order',
      component: OrderComponent
    },{
      path: 'get-order',
      component: GetOrderComponent
    },{
      path: 'get-all-order',
      component: GetAllOrderComponent
    }
    
    
    ]

  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
