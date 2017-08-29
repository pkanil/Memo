import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UtilService } from '../../service/memo.util';

import * as _ from 'underscore';

/**
 * Generated class for the PanelPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-panel',
  templateUrl: 'panel.html',
})
export class PanelPage {

  private selectedMemo = {MM_ID: '', MM_CTNT: '', FD_NAME : ''};

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private util: UtilService) {
  }


  ionViewDidLoad() {

    var param = this.navParams.data;
    var memoId = param.MM_ID;

    this.util.selectLocalMemo(memoId, (res) => {
      this.selectedMemo = res;
      this.selectedMemo.FD_NAME = param.FD_NAME;

     /* setTimeout(function(){
        document.getElementById('memo-textarea').focus();
      },100);*/

    }, (e) => {
      alert(e);
    });
  }

  saveMemo(){
    this.util.updateLocalMemo(this.selectedMemo.MM_ID, this.selectedMemo.MM_CTNT, () => {
    }, () => {
    });
  }

}
