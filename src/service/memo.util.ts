import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite';
import {AlertController} from 'ionic-angular';
import {Platform} from 'ionic-angular';
import {DatePipe} from "@angular/common";
import { URLSearchParams } from "@angular/http"

@Injectable()
export class UtilService {

  private dbName = 'memo7.db';

  constructor(private http: Http, private sqlite: SQLite, private platform: Platform,
              private alertCtrl: AlertController) {


    this.platform.ready().then(() => {

      this.sqlite.create({
        name: this.dbName,
        location: 'default'
      })
        .then((db: SQLiteObject) => {

          db.transaction(tx => {
            tx.executeSql('CREATE TABLE IF NOT EXISTS TBL_FOLDER (FD_ID, FD_NAME, DEFAULT_YN)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS TBL_MEMO (FD_ID, MM_ID, MM_CTNT, CREATE_DDTM, LST_MODIFY_DDTM)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS TBL_USR (EMAIL, LST_MODIFY_DDTM, LOGIN_TP, ENABLE_SYNC)');
            console.log('######### [TBL_FOLDER, TBL_MEMO] table init [success]###########');

            this.updateTime();

          }).catch(e => console.log('[TBL_FOLDER, TBL_MEMO]table init [error] : ' + e));


          db.executeSql('SELECT count(*) AS folder_cnt FROM TBL_FOLDER', {})
            .then((rs) => {
              if (rs.rows.item(0).folder_cnt == 0) {
                //기본 폴더 생성
                db.executeSql('INSERT INTO TBL_FOLDER VALUES (?,?,?)', ['BASE_FOLDER', '기본', 'Y']).then((rs) => {
                  console.log('######### [TBL_FOLDER] insert default folder [success] ###########');
                  console.log(JSON.stringify(rs))
                }).catch(e => console.log('[TBL_FOLDER] insert default folder [error 1]' + e));

                db.executeSql('INSERT INTO TBL_FOLDER VALUES (?,?,?)', ['TRASH_FOLDER', '최근 삭제된 항목', 'Y']).then((rs) => {
                  console.log('######### [TBL_FOLDER] insert default folder [success] ###########');
                  console.log(JSON.stringify(rs))
                }).catch(e => console.log('[TBL_FOLDER] insert default folder [error 2]' + e));

                db.executeSql('INSERT INTO TBL_USR VALUES (?,?,?,?)', ['', '', '', false]).then((rs) => {
                  console.log('######### [TBL_FOLDER] insert default folder [success] ###########');
                  console.log(JSON.stringify(rs))
                }).catch(e => console.log('[TBL_FOLDER] insert default user [error 2]' + e));

              } else {
                db.executeSql('SELECT FD_ID, FD_NAME, DEFAULT_YN FROM TBL_FOLDER', {}).then((rs) => {
                  console.log('######### [TBL_FOLDER] select folder list [success] ###########');
                  console.log(JSON.stringify(rs.rows.item(0)))
                }).catch(e => console.log('[TBL_FOLDER] select folder list [error]' + e));
              }
            }).catch(e => console.log('[TBL_FOLDER] insert default folder [error 4]: ' + e));
        }).catch(e => console.log(e));
    })

  }


  /**
   * 메모,폴더 수정시간 업데이트
   * @param success
   * @param error
   */
  updateTime() {
    var time = new Date().getTime();
    this.sqlite.create({
      name: this.dbName,
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('UPDATE TBL_USR SET LST_MODIFY_DDTM = ?', [time])
        .then((rs) => {
          console.log('updateTime');
        }).catch(e => {
        alert(e)
      });
    }).catch(e => {
      alert(e)
    });
  }

  /**
   * 로컬 사용자 조회
   * @param success
   * @param error
   */
  selectLocalUser(success: Function) {
    this.sqlite.create({
      name: this.dbName,
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('SELECT * FROM TBL_USR', [])
        .then((rs) => {

          if (rs.rows.length == 0) {
            success({
              EMAIL: '',
              LST_MODIFY_DDTM: '',
              LOGIN_TP: '',
              ENABLE_SYNC: false

            });
          } else {
            success(rs.rows.item(0));
          }
        }).catch(e => {
        alert(e);
      });
    }).catch(e => {
      alert(e);
    });
  }

  /**
   * 로컬 사용자 업데이트
   * @param success
   * @param error
   */
  updateLocalUser(param: object, success: Function) {

    var time = new Date().getTime();

    this.sqlite.create({
      name: this.dbName,
      location: 'default'
    }).then((db: SQLiteObject) => {

      var sql = 'UPDATE TBL_USR SET ', setVals = ['LST_MODIFY_DDTM = ?'], qparam:Array<any> = [time];


      if (param['EMAIL']) {
        setVals.push('EMAIL = ?');
        qparam.push(param['EMAIL']);
      }

      if (param['LOGIN_TP']) {
        setVals.push('LOGIN_TP = ?');
        qparam.push(param['LOGIN_TP']);
      }

      if (param['ENABLE_SYNC']) {
        setVals.push('ENABLE_SYNC = ?');
        qparam.push('true');
      }else {
        setVals.push('ENABLE_SYNC = ?');
        qparam.push('false');
      }

      sql += setVals.join(',');

      console.log('<<<< updateLocalUser >>>>>');
      console.log(JSON.stringify(qparam));

      db.executeSql(sql, qparam)
        .then((rs) => {
          success();
          this.updateTime();
        }).catch(e => {
        alert(e);
      });
    }).catch(e => {
      alert(e);
    });
  }

  /**
   * 로컬 메모 조회
   * @param success
   * @param error
   */
  selectLocalMemo(memoId: string, success: Function, error: Function) {
    this.sqlite.create({
      name: this.dbName,
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('SELECT * FROM TBL_MEMO WHERE MM_ID = ?', [memoId])
        .then((rs) => {
          success(rs.rows.item(0));
        }).catch(e => {
        error(e);
      });
    }).catch(e => {
      error(e);
    });
  }

  /**
   * 로컬 메모 업데이트
   * @param success
   * @param error
   */
  updateLocalMemo(memoId: string, ctnt: string, success: Function, error: Function) {
    this.sqlite.create({
      name: this.dbName,
      location: 'default'
    }).then((db: SQLiteObject) => {

      var time = new Date().getTime();

      db.executeSql('UPDATE TBL_MEMO SET MM_CTNT = ?, LST_MODIFY_DDTM = ? WHERE MM_ID = ?', [ctnt, time, memoId])
        .then((rs) => {
          success();
          this.updateTime();
        }).catch(e => {
        error(e);
      });
    }).catch(e => {
      error(e);
    });
  }


  /**
   * 로컬 메모 리스트 조회
   * @param success
   * @param error
   */
  selectLocalMemoList(folderId: string, searchInput: string, success: Function, error: Function) {
    this.sqlite.create({
      name: this.dbName,
      location: 'default'
    }).then((db: SQLiteObject) => {

      db.executeSql('DELETE FROM TBL_MEMO WHERE MM_CTNT == \'\'', []).then(() => {
        db.executeSql('SELECT * FROM TBL_MEMO WHERE FD_ID = ? AND MM_CTNT LIKE \'%' + searchInput + '%\' ORDER BY LST_MODIFY_DDTM DESC', [folderId])
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
      name: this.dbName,
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
              success();
              this.updateTime();
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
   * 메모를 삭제한다.
   * @param success
   * @param error
   */

  removeMemo(memoId: Array<string>, fullDelete: boolean, success: Function, error: Function) {
    var questionStr = [];
    for (var i = 0, cnt = memoId.length; i < cnt; i++) {
      questionStr.push('?');
    }


    var time = new Date().getTime();

    this.sqlite.create({
      name: this.dbName,
      location: 'default'
    }).then((db: SQLiteObject) => {

      if (fullDelete) {
        db.transaction(tx => {
          tx.executeSql('DELETE FROM TBL_MEMO WHERE MM_ID IN (' + questionStr.join(',') + ')', memoId);
        }).then(() => {
          success();
          this.updateTime();
        }).catch(e => error(e));
      } else {
        db.transaction(tx => {
          tx.executeSql('UPDATE TBL_MEMO SET FD_ID = \'TRASH_FOLDER\', LST_MODIFY_DDTM=\'' + time + '\' WHERE MM_ID IN (' + questionStr.join(',') + ')', memoId);
        }).then(() => {
          success();
          this.updateTime();
        }).catch(e => error(e));
      }


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
      name: this.dbName,
      location: 'default'
    }).then((db: SQLiteObject) => {

      //TODO 메모도 삭제 하도록. 추가1
      db.transaction(tx => {
        tx.executeSql('DELETE FROM TBL_FOLDER WHERE FD_ID IN (' + questionStr.join(',') + ')', folderId);
        if (type == 'both') {
          tx.executeSql('UPDATE TBL_MEMO SET FD_ID = \'TRASH_FOLDER\' WHERE FD_ID IN (' + questionStr.join(',') + ')', folderId);
        } else {
          tx.executeSql('UPDATE TBL_MEMO SET FD_ID = \'BASE_FOLDER\' WHERE FD_ID IN (' + questionStr.join(',') + ')', folderId);
        }
      }).then(() => {
        success();
        this.updateTime();
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
      name: this.dbName,
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

          db.executeSql('INSERT INTO TBL_FOLDER VALUES (?,?,?)', [newId, folderName, 'N']).then((rs) => {
            console.log('######### [TBL_FOLDER] insert folder [success] ###########');
            success();
            this.updateTime();
          }).catch(e => {
            console.log('[TBL_FOLDER] insert folder [error 1]' + JSON.stringify(e))
          });

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
      name: this.dbName,
      location: 'default'
    }).then((db: SQLiteObject) => {

      db.executeSql('DELETE FROM TBL_MEMO WHERE MM_CTNT == \'\'', []).then(() => {
        db.executeSql('SELECT T1.*, (SELECT COUNT(*) FROM TBL_MEMO WHERE FD_ID = T1.FD_ID) AS CNT FROM TBL_FOLDER T1', [])
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
      });
    }).catch(e => {
      error(e);
    });
  }


  /**
   * 새로운 메모 생성
   * @param folderId
   * @param success
   * @param error
   */
  createNewMemo(folderId, success: Function, error: Function) {
    this.sqlite.create({
      name: this.dbName,
      location: 'default'
    }).then((db: SQLiteObject) => {
      var memoId = this.getUniqueId();
      var time = new Date().getTime();
      db.executeSql('INSERT INTO TBL_MEMO VALUES (?, ?, ?, ? ,?)', [folderId, memoId, '', time, time])
        .then(() => {
          success(memoId);
          this.updateTime();
        }).catch(e => {
        error(e);
      });
    }).catch(e => {
      error(e);
    });
  }


  /**
   * 메모를 다른 폴더로 이동
   * @param folderId
   * @param memoIdArray
   * @param success
   * @param error
   */
  moveMemo(folderId: string, memoIdArray: Array<string>, success: Function, error: Function) {

    var questionStr = [];
    for (var i = 0, cnt = memoIdArray.length; i < cnt; i++) {
      questionStr.push('?');
    }

    this.sqlite.create({
      name: this.dbName,
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('UPDATE TBL_MEMO SET FD_ID = \'' + folderId + '\' WHERE MM_ID IN (' + questionStr.join(',') + ')', memoIdArray)
        .then(() => {
          success();
          this.updateTime();
        }).catch(e => {
        error(e);
      });
    }).catch(e => {
      error(e);
    });
  }

  /**
   * 서버 사용자 조회
   * @param {string} email
   * @param {Function} success
   */
  selectServerUser(email: string, success: Function) {
    let data = new URLSearchParams();
    data.append('EMAIL', email);
    this.executeBL('memo/user_info', data, res => {
      success(res);
    });
  }


  /**
   * 서버 사용자 추가
   * @param {string} email
   * @param {string} loginTp
   * @param {Function} success
   */
  insertServerUser(email: string, loginTp: string, success: Function) {
    let data = new URLSearchParams();
    data.append('EMAIL', email);
    data.append('LOGIN_TP', loginTp);
    data.append('LST_MOD_TIME', new Date().getTime() + '');
    data.append('USR_KEY', this.getUniqueId());

    this.executeBL('memo/user_insert', data, res => {
      success(res);
    });
  }

  /**
   * 서버 조회
   * @param path
   * @param param
   * @param success
   */
  executeBL(path: string, param: URLSearchParams, success: Function) {
    var SERVICE_URL_PREFIX = 'http://cms.kanil.me/api/process/svc/';

    console.log(SERVICE_URL_PREFIX + path + '.json');

    this.http.post(SERVICE_URL_PREFIX + path + '.json', param)
      .subscribe(
        res => {
          success(res.json())
        }, //For Success Response
        err => {
          alert(JSON.stringify(err))
        } //For Error Response
      );

  }

  getUniqueId() {
    return Math.random().toString(16).substring(2);
  }

}
