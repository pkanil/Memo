import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { FolderListPage } from '../folder-list/folder-list';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController) {

  }

  ionViewDidLoad() {

  }

  nextPage() {
    this.navCtrl.push(FolderListPage);
  }

}
