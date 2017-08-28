import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UtilService } from '../../service/memo.util';
import { AlertController } from 'ionic-angular';
import { URLSearchParams } from "@angular/http"

import * as _ from 'underscore';

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
              private util: UtilService, private alertCtrl: AlertController) {
  }

  private memos = [];
  private viewMode = 'list';
  private showCheckbox = false;
  private selectedMemo = [];
  private slidingItem;

  modify(){
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
    _.each(this.memos, function (e, i) {
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

  ionViewDidLoad() {

    let data = new URLSearchParams();
    data.append('FOLDER_ID', this.navParams.data.FD_ID);
    this.util.executeBL('memo/memo_list_test',data , res => {
      this.memos = res.OutBlock_1;
      _.each(this.memos, function (e, i) {
        e.selected = false;
      });

    });
  }

  deleteMemo(memo:any){

  }

  private doDeleteMemo(memo:any){
    console.log('삭제처리!');
  }

  itemSwipe(slidingItem) {
    this.slidingItem = slidingItem
  }

  moveMemoDetailPage(memo:any) {
    console.log('상세로 이동!', memo);
  }

}
