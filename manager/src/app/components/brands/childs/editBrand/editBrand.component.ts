import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Location } from '@angular/common';
import 'rxjs/add/operator/switchMap';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { RESTService } from '../../../../services/rest.service';
import { ImageLoaderComponent } from '../../../imageLoader/imageLoader.component';

@Component({
  selector: 'app-edit-brand',
  templateUrl: './editBrand.component.html',
  styleUrls: [],
})

export class EditBrandComponent implements OnInit {

  isDataReady = false;

  brand: any;

  uploadedLogo = null;

  constructor(
    private restService: RESTService,
    private route: ActivatedRoute,
    private location: Location,
    private modalService: NgbModal,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap
    .switchMap((params: ParamMap) => this.restService.getBrand(params.get('_id')))
    .subscribe(response => {
      this.brand = response;
      this.isDataReady = true;
    }, err => {
      if (err.status === 401 || err.status === 403) {
        this.restService.logout();
        this.router.navigate(['/login']);
      } else {
      window.alert(JSON.stringify(err));
      console.log(JSON.stringify(err));
      }
    });
  }

  openUploader(e) {
    const file = e.target.files[0];
    if (/^image\/\w+/.test(file.type)) {
      const modalRef = this.modalService.open(ImageLoaderComponent, {size: 'lg'});
      modalRef.componentInstance.imageURL = URL.createObjectURL(file);
      modalRef.result.then(
        (image) => {
          if (this.uploadedLogo) {
            this.restService.deleteImage(this.uploadedLogo).subscribe(
              response => {
                this.uploadedLogo = image._id;
                this.brand.logo = this.uploadedLogo;
                e.target.value = null;
              },
              err => {
                if (err.status === 401 || err.status === 403) {
                  this.restService.logout();
                  this.router.navigate(['/login']);
                } else {
                window.alert(JSON.stringify(err));
                console.log(JSON.stringify(err));
                }
            });
          } else {
            this.uploadedLogo = image._id;
            this.brand.logo = this.uploadedLogo;
            e.target.value = null;
          }
        },
        () => {
          e.target.value = null;
        }
      );
     }
  }

  removeLogo() {
    if (this.uploadedLogo) {
      this.restService.deleteImage(this.uploadedLogo).subscribe(
        response => {
          this.uploadedLogo = null;
          this.brand.logo = '';
        },
        err => {
          if (err.status === 401 || err.status === 403) {
            this.restService.logout();
            this.router.navigate(['/login']);
          } else {
          window.alert(JSON.stringify(err));
          console.log(JSON.stringify(err));
          }
      });
    } else {
      this.brand.logo = '';
    }

  }

  clickSave() {

    if (this.brand.name === undefined || this.brand.name === '') {
      window.alert('Name is not defined.');
      return;
    }

    this.restService.updateBrand(this.brand).subscribe(
      response => {
        this.router.navigate(['/brands']);
      },
      err => {
        if (err.status === 401 || err.status === 403) {
          this.restService.logout();
          this.router.navigate(['/login']);
        } else {
        window.alert(JSON.stringify(err));
        console.log(JSON.stringify(err));
        }
      });
  }

  clickCancel() {
    if (this.uploadedLogo) {
      this.restService.deleteImage(this.uploadedLogo).subscribe(
        response => {
          this.router.navigate(['/brands']);
        },
        err => {
          if (err.status === 401 || err.status === 403) {
            this.restService.logout();
            this.router.navigate(['/login']);
          } else {
          window.alert(JSON.stringify(err));
          console.log(JSON.stringify(err));
          }
        });
    } else {
      this.router.navigate(['/brands']);
    }
  }

}



