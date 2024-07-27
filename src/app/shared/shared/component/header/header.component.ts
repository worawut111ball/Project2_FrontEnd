import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DataSharingService } from 'src/app/modules/DataSharingService';
import { CallserviceService } from 'src/app/modules/services/callservice.service';
import { CartService } from 'src/app/modules/services/cart.service';
export class YourComponent {
  userDetail: any;
  totalItem: number;
  ImageList: any = [
    { value: 'https://example.com/image1.jpg' },
    { value: '' }, // หรือ undefined, null ตามกรณีที่ไม่มีค่า
    // อาจจะมีข้อมูลอื่น ๆ
  ];
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  
  public totalItem: number; // Change to primitive type 'number'
  public userDetail: any;
  imageBlobUrl : any 
  ImageList : any = []
  userId: any;
  profileImgList: any 

  constructor(
    private router: Router,
    private dataSharingService: DataSharingService,
    private callService: CallserviceService,
    private sanitizer: DomSanitizer,
    
    private cartservice: CartService,
   
  ) { 
    this.dataSharingService.userDetail.subscribe(value => {
      const userDetailSession: any = sessionStorage.getItem("userDetail");
      this.userDetail = JSON.parse(userDetailSession);
      this.userId = this.userDetail.userId;
      this.callService.getProfileImgByUserId(this.userDetail.userId).subscribe((res) => {
        if(res.data){
          this.profileImgList = res.data
          for(let profileImg of this.profileImgList){
            this.getImage(profileImg.profileImgName)
          }
        }else{
          window.location.reload()
        }
      });
    });

    this.dataSharingService.cartNumber.subscribe(value => {
      if (value !== null && value !== undefined) {
        this.totalItem = Number(value); 
      }
    });
  }
  
  ngOnInit(): void {
    this.cartservice.getProduct();
    const userDetailSession: any = sessionStorage.getItem("userDetail");
    this.userDetail = JSON.parse(userDetailSession);
  }

  logout(): void {
    sessionStorage.removeItem("userDetail");
    this.dataSharingService.userDetail.next(true);
    this.router.navigate(['/login']);
  }

  getImage(fileNames : any){
    this.callService.getProfileImageByte(fileNames).subscribe((res) => {
      let objectURL = URL.createObjectURL(res);       
      this.imageBlobUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      this.ImageList.push({
        key : fileNames,
        value : this.imageBlobUrl
      } 
    )
    });
  }
}
