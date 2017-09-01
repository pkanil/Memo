import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UtilService } from '../../service/memo.util';
import { Keyboard } from '@ionic-native/keyboard';

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

  private selectedMemo = {MM_ID: '', MM_CTNT: '', FD_NAME : '', LST_MODIFY_DDTM: ''};
  private showConfirmButton = false;
  private _keyboard = null;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private util: UtilService, private keyboard: Keyboard) {

    this._keyboard = keyboard;

    this.keyboard.onKeyboardShow().subscribe(

      res => {
        console.log('open 1');
        //this.showConfirmButton = true;
      }, //For Success Response
      err => {
        console.log('open 2')
      } //For Error Response
    );

    this.keyboard.onKeyboardHide().subscribe(

      res => {
        console.log('hide 1');
        this.showConfirmButton = false;
      }, //For Success Response
      err => {
        console.log('hide 2')
      } //For Error Response
    )

  };

  onFocus() {
    this.showConfirmButton = true;
  }

  onBlur() {
    //this.showConfirmButton = false;
  }

  removeMemo(){
    this.util.removeMemo([this.selectedMemo.MM_ID], false, () => {
      this.navCtrl.pop();
    }, (e) => {
      alert(e)
    });
  }

  ionViewDidLoad() {

    var param = this.navParams.data;
    var memoId = param.MM_ID;

    this.util.selectLocalMemo(memoId, (res) => {
      this.selectedMemo = res;
      this.selectedMemo.FD_NAME = param.FD_NAME;

      if(param.IS_NEW) {
        setTimeout(function(){
          document.getElementById('memo-textarea').focus();
        },500);
      }
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
