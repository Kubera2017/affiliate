import { Component } from '@angular/core';
import { NgSwitch } from '@angular/common';
import { OnInit } from '@angular/core';



import { RESTService } from '../../services/rest.service';



@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: [],
})

export class ProductsComponent implements OnInit {

  marketplaces: any;

  constructor(
    private restService: RESTService) {}

  ngOnInit(): void {
    this.getMarketplaces();
  }



  getMarketplaces() {
    this.restService.getMarketplaces().subscribe(
      response => {
          this.marketplaces = response;
      },
      err => {
      console.log(err);
    });
  }




}