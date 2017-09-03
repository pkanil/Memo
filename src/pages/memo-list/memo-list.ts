import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UtilService } from '../../service/memo.util';
import { AlertController } from 'ionic-angular';
import { URLSearchParams } from "@angular/http"
import { ModalController } from 'ionic-angular';
import { PanelPage } from '../panel/panel';

import * as _ from 'underscore';
import {FolderSelectPage} from "../folder-select/folder-select";

/**
 * Generated class for the MemoListPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-memo-list',
  templateUrl: 'memo-list.html',
})
export class MemoListPage {

  constructor(private navCtrl: NavController, private navParams: NavParams,
              private util: UtilService, private alertCtrl: AlertController,
              private modalCtrl: ModalController) {

    this.$rootScope = util.$rootScope;
    this.$rootScope.$this = this;

  }
  private $rootScope;
  private memos = [];
  private viewMode = 'list';
  private showCheckbox = false;
  private selectedMemo = [];
  private slidingItem;
  private selectedFolder = {
    FD_NAME : '',
    FD_ID: ''
  };

  private searchObj = {
    value : ''
  };

  panDown($e) {
    //console.log(JSON.stringify($e))
  };

  searchInput($event) {

    console.log('searchInput : ' +  this.searchObj.value);

    this.setMemoList(this.navParams.data.FD_ID);

  };

  searchCancel($event) {
    console.log('searchCancel')
  };

  modify(){

    if(this.memos.length == 0) {
      return;
    }

    this.viewMode = 'modify';
    this.showCheckbox = true;
    if(this.slidingItem) {
      this.slidingItem.close();
    }
  }

  complete(){
    this.selectedMemo = [];
    this.viewMode = 'list';
    this.showCheckbox = false;

    var searchValue = this.searchObj.value;

    _.each(this.memos, function (e, i) {

      var ctnt = e.MM_CTNT;
      var split = ctnt.split("\n");

      var title = split[0];

      if(title.indexOf(searchValue) > -1) {
        title = title.replace(new RegExp(searchValue, "g"), '<span class="search-result">' + searchValue + '</span>');
      }

      e.TITLE = title;

      if (split.length > 1) {
        if (searchValue) {
          var index = _.findIndex(split, function (e, i) {
            if (i > 0) {
              if (e.indexOf(searchValue) > -1) {
                return true;
              }
            }
          });
        }


        if (index > -1) {
          e.SUMMARY = split[index].replace(new RegExp(searchValue, "g"), '<span class="search-result">' + searchValue + '</span>');
        }else {
          e.SUMMARY = split[1];
        }

      } else {
        e.SUMMARY = '추가 텍스트 없음';
      }

      e.selected = false;
    });
  }

  changeCheck(){
    this.selectedMemo = _.filter(this.memos, function(e){
      return e.selected;
    });
  }

  changeMode(mode:string) {
    this.viewMode = mode;
    this.showCheckbox = (mode == 'modify');
  }

  setMemoList(folderId:string) {
    this.util.selectLocalMemoList(folderId, this.searchObj.value, res=>{
      this.memos = res;
      this.complete();
    },res=>{
      alert(res);
    });
  }

  ionViewWillEnter() {

    this.$rootScope.lastModTime = new Date().getTime();

    this.selectedFolder = this.navParams.data;

    this.setMemoList(this.navParams.data.FD_ID);

    this.$rootScope.reload = this.ionViewWillEnter;

    /*let data = new URLSearchParams();
     data.append('FOLDER_ID', this.navParams.data.FD_ID);
     this.util.executeBL('memo/memo_list_test',data , res => {
     this.memos = res.OutBlock_1;
     _.each(this.memos, function (e, i) {
     e.selected = false;
     });

     });*/
  }

  ionViewDidLoad() {

  }

  deleteMemo(arg:any){

    var isFullDelete = this.selectedFolder.FD_ID == 'TRASH_FOLDER';

    if(arg) {
      if(arg == 'all') {
        //전체 메모 삭제

        let _alert = this.alertCtrl.create({
          title: '모든 메모를 삭제하시겠습니까?',
          buttons: [
            {
              text: '모두 삭제',
              cssClass: 'color-danger',
              handler: () => {
                var ids = [];

                _.each(this.memos, function (e, i) {
                  ids.push(e.MM_ID);
                });

                this.util.removeMemo(ids, isFullDelete, () => {
                  this.setMemoList(this.navParams.data.FD_ID);
                }, (e) => {
                  alert(e)
                });
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

        _alert.present();

      }else {
        //하나 삭제
        this.util.removeMemo([arg['MM_ID']], isFullDelete, () => {
          this.setMemoList(this.navParams.data.FD_ID);
        }, (e) => {
          alert(e)
        });

      }
    }else {
      //선택된 메모 삭제

      var ids = [];

      _.each(this.selectedMemo, function (e, i) {
        ids.push(e.MM_ID);
      });

      this.util.removeMemo(ids, isFullDelete, () => {
        this.setMemoList(this.navParams.data.FD_ID);
      }, (e) => {
        alert(e)
      });

    }

  }

  moveMemo(arg:any) {

    var moveObj = {
      title : '',
      id: [],
      exceptFolderId: ''
    };

    if(arg) {
      if (arg == 'all') {
        //전체 이동
        _.each(this.memos, function (e, i) {
          moveObj.id.push(e.MM_ID);
        });

        if(this.memos.length == 1) {
          moveObj.title = this.memos[0].MM_CTNT.split('\n')[0];
        }else {
          moveObj.title = this.memos[0].MM_CTNT.split('\n')[0] + ' 외 ' + (this.memos.length - 1) + '개';
        }


      }else {
        //하나만 이동
        moveObj.id = [arg.MM_ID];
        moveObj.title = arg.MM_CTNT.split('\n')[0];
      }
    }else {
      //선택된문서들 이동
      _.each(this.selectedMemo, function (e, i) {
        moveObj.id.push(e.MM_ID);
      });

      if(this.selectedMemo.length == 1) {
        moveObj.title = this.selectedMemo[0].MM_CTNT.split('\n')[0];
      }else {
        moveObj.title = this.selectedMemo[0].MM_CTNT.split('\n')[0] + ' 외 ' + (this.selectedMemo.length - 1) + '개';
      }

    }

    moveObj.exceptFolderId = this.selectedFolder.FD_ID;

    let myModal = this.modalCtrl.create(FolderSelectPage, moveObj);
    myModal.onDidDismiss(() => {
      // Call the method to do whatever in your home.ts
      console.log('Modal closed');
      this.setMemoList(this.navParams.data.FD_ID);
    });
    myModal.present();



  }


  itemSwipe(slidingItem) {
    this.slidingItem = slidingItem
  }

  moveWriteMemo(memo:any) {
    //console.log('상세로 이동!', memo);

    var param = {
      FD_NAME : this.selectedFolder.FD_NAME
    };

    if(memo) {
      param['MM_ID'] = memo.MM_ID;
      this.navCtrl.push(PanelPage, param);
    }else {

      if(this.selectedFolder.FD_ID == 'TRASH_FOLDER') {
        this.navParams.data.FD_ID = 'BASE_FOLDER';
        this.navParams.data.FD_NAME = '기본';
        param.FD_NAME = '기본';
      }

      this.util.createNewMemo(this.selectedFolder.FD_ID, (memoId) => {
        param['MM_ID'] = memoId;
        param['IS_NEW'] = true;
        this.navCtrl.push(PanelPage, param);
      }, (e) => {
        alert(e)
      })
    }

  }

}
