import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite';
import {AlertController} from 'ionic-angular';
import {Platform} from 'ionic-angular';

@Injectable()
export class UtilService {


  constructor(private http: Http, private sqlite: SQLite, private platform: Platform,
              private alertCtrl: AlertController) {

    this.platform.ready().then(() => {
      this.sqlite.create({
        name: 'memo.db',
        location: 'default'
      })
        .then((db: SQLiteObject) => {

          db.transaction(tx => {
            tx.executeSql('CREATE TABLE IF NOT EXISTS TBL_FOLDER (FD_ID, FD_NAME, FD_DEL_YN, DEFAULT_YN)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS TBL_MEMO (FD_ID, MM_ID, MM_TITLE, MM_DEL_YN, DEFAULT_YN, CREATE_DDTM, LST_MODIFY_DDTM)');
            console.log('######### [TBL_FOLDER, TBL_MEMO] table init [success]###########');
          }).catch(e => console.log('[TBL_FOLDER, TBL_MEMO]table init [error] : ' + e));


          db.executeSql('SELECT count(*) AS folder_cnt FROM TBL_FOLDER', {})
            .then((rs) => {
              if (rs.rows.item(0).folder_cnt == 0) {
                //기본 폴더 생성
                db.executeSql('INSERT INTO TBL_FOLDER VALUES (?,?,?,?)', ['BASE_FOLDER', '기본', 'N', 'Y']).then((rs) => {
                  console.log('######### [TBL_FOLDER] insert default folder [success] ###########');
                  console.log(JSON.stringify(rs))
                }).catch(e => console.log('[TBL_FOLDER] insert default folder [error 1]' + e));

              } else {
                db.executeSql('SELECT FD_ID, FD_NAME, FD_DEL_YN, DEFAULT_YN FROM TBL_FOLDER', {}).then((rs) => {
                  console.log('######### [TBL_FOLDER] select folder list [success] ###########');
                  console.log(JSON.stringify(rs.rows.item(0)))
                }).catch(e => console.log('[TBL_FOLDER] select folder list [error]' + e));
              }
            }).catch(e => console.log('[TBL_FOLDER] insert default folder [error 2]: ' + e));
        }).catch(e => console.log(e));
    })

  }


  /**
   * 로컬 메모 리스트 조회
   * @param success
   * @param error
   */
  selectLocalMemoList(folderId: string, success: Function, error: Function) {
    this.sqlite.create({
      name: 'memo.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('SELECT * FROM TBL_MEMO WHERE FD_ID = ? AND  MM_DEL_YN <> ?', [folderId, 'Y'])
        .then((rs) => {
          var len = rs.rows.length;
          var list = [];
          for (var i = 0; i < len; i++) {
            list.push(rs.rows.item(i));
          }
          success(list);
        }).catch(e => {
        error(e);
      });
    }).catch(e => {
      error(e);
    });
  }


  /**
   * 폴더명을 변경한다.
   * @param success
   * @param error
   */

  modifyFolder(folderId: string, folderName: string, success: Function, error: Function) {
    this.sqlite.create({
      name: 'memo.db',
      location: 'default'
    }).then((db: SQLiteObject) => {


      db.executeSql('SELECT * FROM TBL_FOLDER WHERE FD_NAME = ?', [folderName])
        .then((rs) => {
          var len = rs.rows.length;
          if (len > 0) {
            let _alert = this.alertCtrl.create({
              title: '이름이 이미 사용 중임',
              message: '다른 이름을 선택하십시오.',
              buttons: [{
                text: '확인',
                role: 'cancel'
              }]
            });
            _alert.present();
            return;
          }

          db.executeSql('UPDATE TBL_FOLDER SET FD_NAME = ? WHERE FD_ID = ?', [folderName, folderId])
            .then((rs) => {
              success()
            }).catch(e => {
            error(e);
          });

        }).catch(e => {
        error(e);
      });


    }).catch(e => {
      error(e);
    });
  }


  /**
   * 폴더를 삭제한다.
   * @param success
   * @param error
   */

  removeFolder(folderId: Array<string>, type: string, success: Function, error: Function) {

    var questionStr = [];

    for (var i = 0, cnt = folderId.length; i < cnt; i++) {
      questionStr.push('?');
    }

    this.sqlite.create({
      name: 'memo.db',
      location: 'default'
    }).then((db: SQLiteObject) => {

      //TODO 메모도 삭제 하도록. 추가1
      db.transaction(tx => {
        tx.executeSql('DELETE FROM TBL_FOLDER WHERE FD_ID IN (' + questionStr.join(',') + ')', folderId);
        if(type == 'both') {
          tx.executeSql('UPDATE TBL_MEMO SET MM_DEL_YN = \'Y\' WHERE FD_ID IN (' + questionStr.join(',') + ')', folderId);
        }
      }).then(() => {
        success();
      }).catch(e => error(e));

    }).catch(e => {
      error(e);
    });
  }


  /**
   * 폴더를 생성한다.
   * @param success
   * @param error
   */

  addFolder(folderName: string, success: Function, error: Function) {

    var newId = this.getUniqueId();

    this.sqlite.create({
      name: 'memo.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('SELECT * FROM TBL_FOLDER WHERE FD_NAME = ?', [folderName])
        .then((rs) => {
          var len = rs.rows.length;
          if (len > 0) {
            let _alert = this.alertCtrl.create({
              title: '이름이 이미 사용 중임',
              message: '다른 이름을 선택하십시오.',
              buttons: [{
                text: '확인',
                role: 'cancel'
              }]
            });
            _alert.present();
            return;
          }

          db.executeSql('INSERT INTO TBL_FOLDER VALUES (?,?,?,?)', [newId, folderName, 'N', 'N']).then((rs) => {
            console.log('######### [TBL_FOLDER] insert folder [success] ###########');
            success();
          }).catch(e => console.log('[TBL_FOLDER] insert folder [error 1]' + e));

        }).catch(e => {
        error(e);
      });
    }).catch(e => {
      error(e);
    });
  }

  /**
   * 로컬 폴더 리스트 조회
   * @param success
   * @param error
   */
  selectLocalFolderList(success: Function, error: Function) {
    this.sqlite.create({
      name: 'memo.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('SELECT T1.*, (SELECT COUNT(*) FROM TBL_MEMO WHERE FD_ID = T1.FD_ID AND MM_DEL_YN <> ?) AS CNT FROM TBL_FOLDER T1 WHERE FD_DEL_YN <> ?', ['Y', 'Y'])
        .then((rs) => {
          var len = rs.rows.length;
          var list = [];
          for (var i = 0; i < len; i++) {
            list.push(rs.rows.item(i));
          }
          success(list);
        }).catch(e => {
        error(e);
      });
    }).catch(e => {
      error(e);
    });
  }


  /**
   * 서버 조회
   * @param path
   * @param param
   * @param success
   */
  executeBL(path: string, param: any, success: Function) {
    var SERVICE_URL_PREFIX = 'http://cms.kanil.me/api/process/svc/';

    this.http.post(SERVICE_URL_PREFIX + path + '.json', param)
      .subscribe(
        res => {
          success(res.json())
        }, //For Success Response
        err => {
          console.error(err)
        } //For Error Response
      );

  }

  getUniqueId() {
    return Math.random().toString(16).substring(2);
  }

}
