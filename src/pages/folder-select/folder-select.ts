import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ViewController } from 'ionic-angular';
import { UtilService } from '../../service/memo.util';
import * as _ from 'underscore';

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


  private selectedMemoInfo = {
    title: '',
    id: [],
    folders : [],
    exceptFolderId: '',
    memosPath: ''
  };

  constructor(private navCtrl: NavController, private navParams: NavParams,
              private viewCtrl: ViewController, private util: UtilService) {
  }

  /*ionViewWillEnter() {
    console.log('ionViewWillEnter FolderSelectPage');
  }*/

  ionViewDidLoad() {
    console.log('ionViewDidLoad FolderSelectPage');
    console.log(JSON.stringify(this.navParams.data));
    this.selectedMemoInfo = this.navParams.data;

    if (this.selectedMemoInfo.id.length >= 3) {
      this.selectedMemoInfo.memosPath = 'assets/img/memos_03.png';
    }else if (this.selectedMemoInfo.id.length >= 2) {
      this.selectedMemoInfo.memosPath = 'assets/img/memos_02.png';
    }else {
      this.selectedMemoInfo.memosPath = 'assets/img/memos_01.png';
    }

    this.util.selectLocalFolderList(res=>{

      res = _.without(res, _.findWhere(res, {
        FD_ID: this.selectedMemoInfo.exceptFolderId
      }));

      this.selectedMemoInfo.folders = res;
    },res=>{
      alert(res);
    });
  }

  selectFolder(folder) {
    this.util.moveMemo(folder.FD_ID, this.selectedMemoInfo.id, () => {
      this.viewCtrl.dismiss();
    }, (e) => {
      alert(e)
    })
  }

  cancel() {
    this.viewCtrl.dismiss();
  }

}
