import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UtilService } from '../../service/memo.util';
import { AlertController } from 'ionic-angular';
import { MemoListPage } from '../memo-list/memo-list';
import { URLSearchParams } from "@angular/http"
import {Platform} from 'ionic-angular';
import { ModalController } from 'ionic-angular';

import {SetupPage} from "../setup/setup";


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
              private util: UtilService, private alertCtrl: AlertController,
              private platform: Platform, private modalCtrl: ModalController) {

    this.$rootScope = util.$rootScope;

    this.$rootScope.$this = this;


    this.platform.ready().then(() => {
      this.setFolderList();
    })


  }

  private $rootScope;

  private folders = [];
  private viewMode = 'list';
  private showCheckbox = false;
  private selectedFolder = [];
  private slidingItem;


  setup(){

    this.util.selectLocalUser(res => {
      console.log('selectLocalUser : ' + JSON.stringify(res));

      let myModal = this.modalCtrl.create(SetupPage, res);

      myModal.onDidDismiss(() => {
        // Call the method to do whatever in your home.ts
        console.log('Modal closed');
        this.setFolderList();
        //this.setMemoList(this.navParams.data.FD_ID);
      });
      myModal.present();
    });


  }


  ionViewWillEnter() {

    //alert('ionViewWillEnter')

    this.$rootScope.lastModTime = new Date().getTime();

    this.$rootScope.reload = this.setFolderList;

    if(window['sqlitePlugin']) {
      this.setFolderList();
    }

  }


  setFolderList() {
    this.util.selectLocalFolderList(res=>{
      //console.log('selectLocalFolderList success : ' + JSON.stringify(res));

      var trashIndex = _.findIndex(res, function (e) {
        return e.FD_ID == 'TRASH_FOLDER';
      });

      var baseIndex = _.findIndex(res, function (e) {
        return e.FD_ID == 'BASE_FOLDER';
      });

      res[trashIndex] = res.splice(res.length - 1, 1, res[trashIndex])[0];
      res[baseIndex] = res.splice(0, 1, res[baseIndex])[0];

      this.folders = res;
      this.complete();
    },res=>{
      alert(res);
    });
  }


  modify(){
    this.viewMode = 'modify';
    this.showCheckbox = true;
    if(this.slidingItem) {
      this.slidingItem.close();
    }
  }

  complete(){
    this.selectedFolder = [];
    this.viewMode = 'list';
    this.showCheckbox = false;
    _.each(this.folders, function (e, i) {
      e.selected = false;
    });
  }

  changeCheck(){
    this.selectedFolder = _.filter(this.folders, function(e){
      return e.selected;
    });
  }

  changeMode(mode:string) {
    this.viewMode = mode;
    this.showCheckbox = (mode == 'modify');
  }

  ionViewDidLoad() {

  }

  deleteFolder(folder:any){

    var hasMemo = false;

    if(folder) {
      hasMemo = folder.CNT > 0;
    }else {
      var memoContainFolder = _.filter(this.selectedFolder, function (e) {
        return (e.CNT || 0) > 0;
      });
      hasMemo = memoContainFolder.length > 0
    }

    if(hasMemo) {
      let alert = this.alertCtrl.create({
        title: '폴더를 삭제하시겠습니까?',
        message: '폴더만 삭제하면 그 안에 있던 메모가 \'기본\' 폴더로 이동합니다.',
        buttons: [
          {
            text: '폴더 및 메모 삭제',
            cssClass: 'color-danger',
            handler: () => {
              this.doDeleteFolder(folder, 'both');
            }
          },
          {
            text: '폴더만 삭제',
            cssClass: 'color-danger',
            handler: () => {
              this.doDeleteFolder(folder, 'folder');
            }
          },
          {
            text: '취소',
            role: 'cancel',
            cssClass: 'color-warning',
            handler: () => { }
          }
        ]
      });

      alert.present();

    }else {
      this.doDeleteFolder(folder, 'folder')
    }

  }

  private doDeleteFolder(folder: any, type) {
    console.log('삭제처리!', type);

    var selectedFolderId = [];

    if(folder) {
      selectedFolderId.push(folder.FD_ID);
    }else {
      _.each(this.selectedFolder, function(e, i){
        selectedFolderId.push(e.FD_ID);
      });
    }

    this.util.removeFolder(selectedFolderId, type, () => {
      this.setFolderList();
    }, (res) => {
      alert('삭제실패 : ' + res);
    });

  }

  itemSwipe(slidingItem) {
   this.slidingItem = slidingItem
  }

  presentPromptModifyFolder(folder) {

    this.slidingItem && this.slidingItem.close();

    let _alert = this.alertCtrl.create({
      title: '폴더 이름 변경',
      message: '이 폴더의 새로운 이름을 입력하십시오.',
      inputs: [
        {
          name: 'folder_name',
          value: folder.FD_NAME,
          placeholder: '이름',
          id: 'modify-folder-name-input'
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

            this.util.modifyFolder(folder.FD_ID, data.folder_name, () => {
              this.setFolderList();
            }, (e) => alert(e));

            return true;
          }
        }
      ]
    });
    _alert.present().then(()=>{
      document.getElementById('modify-folder-name-input').focus();
    });
  }

  presentPromptNewFolder() {

    this.slidingItem && this.slidingItem.close();

    let _alert = this.alertCtrl.create({
      title: '새로운 폴더',
      message: '이 폴더의 이름을 입력하십시오.',
      inputs: [
        {
          name: 'folder_name',
          placeholder: '이름',
          id: 'new-folder-name-input'
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

            this.util.addFolder(data.folder_name, () => {
              this.setFolderList();
            }, (e) => alert(e))

            return true;
          }
        }
      ]
    });
    _alert.present().then(()=>{
      document.getElementById('new-folder-name-input').focus();
    });
  }

  moveMemoPage(folder) {
    this.navCtrl.push(MemoListPage, folder);
  }

}
