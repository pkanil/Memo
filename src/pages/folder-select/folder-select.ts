import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ViewController } from 'ionic-angular';
/**
 * Generated class for the FolderSelectPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-folder-select',
  templateUrl: 'folder-select.html',
})
export class FolderSelectPage {

  constructor(private navCtrl: NavController, private navParams: NavParams,
              private viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad FolderSelectPage');
  }

  cancel(){
    this.viewCtrl.dismiss();
  }

}
