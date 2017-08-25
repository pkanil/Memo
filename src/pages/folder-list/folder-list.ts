import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UtilService } from '../../service/memo.util';
import { AlertController } from 'ionic-angular';
import * as _ from 'underscore';

/**
 * Generated class for the FolderListPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-folder-list',
  templateUrl: 'folder-list.html',
})
export class FolderListPage {

  constructor(private navCtrl: NavController, private navParams: NavParams,
              private util: UtilService, private alertCtrl: AlertController) {
  }

  private users = [];
  private viewMode = 'list';
  private showCheckbox = false;


  modify(){
    this.viewMode = 'modify';
    this.showCheckbox = true;
  }

  complete(){
    this.viewMode = 'list';
    this.showCheckbox = false;
    _.each(this.users, function (e, i) {
      e.selected = false;
    });
  }

  changeMode(mode:string) {
    this.viewMode = mode;
    this.showCheckbox = (mode == 'modify');
  }

  ionViewDidLoad() {

    this.util.executeBL('sinsung/name_list', res => {
      this.users = res.OUTPUT1;
      _.each(this.users, function (e, i) {
        e.selected = false;
      });

    });
  }

  presentPrompt() {
    let alert = this.alertCtrl.create({
      title: '새로운 폴더',
      message: '이 폴더의 이름을 입력하십시오.',
      inputs: [
        {
          name: 'folder_name',
          placeholder: '이름'
        }
      ],
      buttons: [
        {
          text: '취소',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: '저장',
          handler: data => {
            if(!data.folder_name) {
              return false;
            }
            return true;
          }
        }
      ]
    });
    alert.present();
  }

}
