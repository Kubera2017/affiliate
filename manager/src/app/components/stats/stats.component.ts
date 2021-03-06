import { Component } from '@angular/core';
import { NgSwitch } from '@angular/common';
import { OnInit } from '@angular/core';



import { RESTService } from '../../services/rest.service';



@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: [],
})

export class StatsComponent implements OnInit {

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
