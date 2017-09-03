import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite';
import {AlertController} from 'ionic-angular';
import {Platform} from 'ionic-angular';
import {DatePipe} from "@angular/common";
import { URLSearchParams } from "@angular/http"
import * as _ from 'underscore';
import { InAppPurchase } from '@ionic-native/in-app-purchase';
@Injectable()
export class UtilService {

  private dbName = 'memo7.db';

  public $rootScope = {
    syncing : false,
    lastModTime: 0,
    $this : null,
    reload: function(){
      console.log('reload');
    }
  };

  constructor(private http: Http, private sqlite: SQLite, private platform: Platform,
              private alertCtrl: AlertController, private iap: InAppPurchase) {

    this.$rootScope.lastModTime = new Date().getTime();

    this.platform.ready().then(() => {


    /*this.iap
        .getProducts(['memo.sync01'])
        .then((products) => {
          console.log('getProducts success : ' + JSON.stringify(products));
          //  [{ productId: 'com.yourapp.prod1', 'title': '...', description: '...', price: '...' }, ...]

          this.iap
            .buy('memo.sync01')
            .then(data => {
              alert('구매 성공!');
              //this.iap.consume(data.productType, data.receipt, data.signature);
            })
            .then(() => alert('product was successfully consumed!'))
            .catch( err=> alert('구매에러 : ' + JSON.stringify(err)));

        })
        .catch((err) => {
          alert('getProducts err ' + err);
        });*/




      this.sqlite.create({
        name: this.dbName,
        location: 'default'
      })
        .then((db: SQLiteObject) => {

          db.transaction(tx => {
            tx.executeSql('CREATE TABLE IF NOT EXISTS TBL_FOLDER (FD_ID, FD_NAME, DEFAULT_YN)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS TBL_MEMO (FD_ID, MM_ID, MM_CTNT, CREATE_DDTM, LST_MODIFY_DDTM)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS TBL_USR (EMAIL, USR_KEY, LST_MODIFY_DDTM, LOGIN_TP, ENABLE_SYNC)');
            console.log('######### [TBL_FOLDER, TBL_MEMO] table init [success]###########');

            //this.updateTime();

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

                db.executeSql('INSERT INTO TBL_USR VALUES (?,?,?,?,?)', ['', '', '', '', false]).then((rs) => {
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


      window.setTimeout(() => {
        this.syncServer()
      }, 1000 * 10);

    })

  }


  /**
   * 메모,폴더 수정시간 업데이트
   * @param success
   * @param error
   */
  updateTime() {
    var time = new Date().getTime();
    this.$rootScope.lastModTime = time;
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
              USR_KEY : '',
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

      var sql = 'UPDATE TBL_USR SET ', setVals = [], qparam:Array<any> = [];


      if (param['USR_KEY']) {
        setVals.push('USR_KEY = ?');
        qparam.push(param['USR_KEY']);
      }

      if (param['LST_MODIFY_DDTM']) {
        setVals.push('LST_MODIFY_DDTM = ?');
        qparam.push(time);
      }

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
          //this.updateTime();

          if(param['ENABLE_SYNC'] === true) {
            this.syncServer();
          }

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
    data.append('LST_MOD_TIME', '1');

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


  syncServer(){

    console.log('<<<<<<<<<<<<<<< syncServer >>>>>>>>>>>>>>');

    var _time = new Date().getTime();

    if ((_time - this.$rootScope.lastModTime) > (1000 * 60)) {
      console.log('60초이상 멈춰있음. 스킵.');
      window.setTimeout(() => {
        this.syncServer()
      }, 1000 * 10);
      return;
    }


    this.selectLocalUser(localData => {
      console.log('<<<<<<<<<<<<<<< syncServer >>>>>>>>>>>>>>' + localData.ENABLE_SYNC);

      if (localData.ENABLE_SYNC === 'true') {

        this.$rootScope.syncing = true;

        var localUserKey = localData.USR_KEY;
        var localEmail = localData.EMAIL;
        var localModTime = localData.LST_MODIFY_DDTM;

        this.selectServerUser(localEmail, serverData => {
          var serverModTime = serverData.LST_MOD_TIME || 1;


          console.log('[localModTime] : ' + localModTime);
          console.log('[serverModTime] : ' + serverModTime);

          if(!serverModTime && !localModTime) {
            console.log('서버 조회 오류');
            this.$rootScope.syncing = false;
            window.setTimeout(() => {
              this.syncServer()
            }, 1000 * 10);
            return;
          }

          if (serverModTime == localModTime) {
            console.log('동기화 필요 없음');
            this.$rootScope.syncing = false;
            window.setTimeout(() => {
              this.syncServer()
            }, 1000 * 10);
            return;
          }

          var newerData = 'server';
          if(localModTime && (localModTime > serverModTime)) {
            newerData = 'local';
          }

          if(newerData == 'local') {

            var localData = {
              FOLDER : [],
              MEMOS : []
            };

            this.sqlite.create({
              name: this.dbName,
              location: 'default'
            }).then((db: SQLiteObject) => {


              db.executeSql('SELECT * FROM TBL_FOLDER', [])
                .then((rs) => {
                  var len = rs.rows.length;
                  for (var i = 0; i < len; i++) {
                    localData.FOLDER.push(rs.rows.item(i));
                  }

                  db.executeSql('SELECT * FROM TBL_MEMO', [])
                    .then((rs) => {
                      var len = rs.rows.length;
                      for (var i = 0; i < len; i++) {
                        localData.MEMOS.push(rs.rows.item(i));
                      }

                      console.log(' >>>>>>>>>>>>> LOCAL DATA <<<<<<<<<<<<<<<');
                      //console.log(JSON.stringify(localData));

                      var inputStr = this.comporess(JSON.stringify(localData));
                      //webponent.export.util.compress.LZString.decompressFromBase64(inputStr))

                      console.log(inputStr);

                      let data = new URLSearchParams();
                      data.append('USR_KEY', localUserKey);
                      data.append('LST_MOD_TIME', localModTime);
                      data.append('inputStr', inputStr);

                      this.executeBL('memo/sync', data, res=>{

                        console.log('서버에 전송 성공 : ' + res.LST_MOD_TIME);
                        this.$rootScope.syncing = false;
                        window.setTimeout(() => {
                          this.syncServer()
                        }, 1000 * 10);
                      });

                    }).catch(e => {
                    alert(e);
                    this.$rootScope.syncing = false;
                    window.setTimeout(() => {
                      this.syncServer()
                    }, 1000 * 10);
                  });

                }).catch(e => {
                alert(e);
                this.$rootScope.syncing = false;
                window.setTimeout(() => {
                  this.syncServer()
                }, 1000 * 10);
              });

            }).catch(e => {
              alert(e);
              this.$rootScope.syncing = false;
              window.setTimeout(() => {
                this.syncServer()
              }, 1000 * 10);
            });
          }else {
            /*console.log('추후 개발');
            window.setTimeout(() => {
              this.syncServer()
            }, 1000 * 10);*/

            let data = new URLSearchParams();
            data.append('USR_KEY', localUserKey);

            this.executeBL('memo/selectServerData', data, res => {
              var temp = res.RESULT;

              console.log('<<<<<<<<import>>>>>>>>>');
              console.log(this.decompressFromBase64(temp));

              this.importServerData(JSON.parse(this.decompressFromBase64(temp)), serverModTime);
              this.$rootScope.syncing = false;
              if(_.isFunction(this.$rootScope.reload)) {
                this.$rootScope.reload.apply(this.$rootScope.$this);
              }

              window.setTimeout(() => {
                this.syncServer()
              }, 1000 * 10);

            });


          }

        });
      }else {

        console.log('동기화 안함.');
       /* window.setTimeout(() => {
          this.syncServer()
        }, 1000 * 20);*/
      }
    });
  }

  getUniqueId() {
    return Math.random().toString(16).substring(2);
  }



  importServerData(data:object, serverModTime:string) {

    var folders = data['FOLDER'];
    var memos = data['MEMO'];

    var insertFolderSqls = [];
    var insertMemosSqls = [];

    _.each(memos, function (e, i) {
      insertMemosSqls.push(
        [ 'INSERT INTO TBL_MEMO VALUES (?, ?, ?, ? ,?)', [e.M_FD_ID, e.MM_ID, e.MM_CTNT, e.CREATE_DDTM, e.LST_MODIFY_DDTM] ]
      );
    });

    _.each(folders, function (e, i) {
      insertFolderSqls.push(
        [ 'INSERT INTO TBL_FOLDER VALUES (?,?,?)', [e.FD_ID, e.FD_NAME, e.DEFAULT_YN] ]
      );
    });

    //console.log(insertMemosSqls);
    //console.log(insertFolderSqls);

    var sqls = [['DELETE FROM TBL_MEMO', []], ['DELETE FROM TBL_FOLDER', []]];

    sqls = sqls.concat(insertMemosSqls);
    sqls = sqls.concat(insertFolderSqls);

    sqls.push(['UPDATE TBL_USR SET LST_MODIFY_DDTM = ?', [serverModTime]]);


    this.sqlite.create({
      name: this.dbName,
      location: 'default'
    }).then((db: SQLiteObject) => {

      db.sqlBatch(sqls).then(res=>{
        console.log('import 성공!!');
        //this.navCtrl.setRoot(this.navCtrl.getActive().component);
      }).catch(e => {
        alert('import 실패!!');
      });

    }).catch(e => {
      alert(e);
    });

  }








  comporess(input:string){

    var base64Characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";


    if (input == null) return "";
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = compress(input);

    while (i < input.length * 2) {

      if (i % 2 == 0) {
        chr1 = input.charCodeAt(i / 2) >> 8;
        chr2 = input.charCodeAt(i / 2) & 255;
        if (i / 2 + 1 < input.length)
          chr3 = input.charCodeAt(i / 2 + 1) >> 8;
        else
          chr3 = NaN;
      } else {
        chr1 = input.charCodeAt((i - 1) / 2) & 255;
        if ((i + 1) / 2 < input.length) {
          chr2 = input.charCodeAt((i + 1) / 2) >> 8;
          chr3 = input.charCodeAt((i + 1) / 2) & 255;
        } else
          chr2 = chr3 = NaN;
      }
      i += 3;

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output = output +
        base64Characters[enc1] + base64Characters[enc2] +
        base64Characters[enc3] + base64Characters[enc4];

    }

    function compress(uncompressed) {

      if (uncompressed === null || uncompressed === undefined) {
        return '';
      }

      var context = {
        dictionary: {},
        dictionaryToCreate: {},
        c: "",
        wc: "",
        w: "",
        enlargeIn: 2, // Compensate for the first entry which should not count
        dictSize: 3,
        numBits: 2,
        result: "",
        data: {string: "", val: 0, position: 0}
      }, i;

      for (i = 0; i < uncompressed.length; i += 1) {
        context.c = uncompressed.charAt(i);
        if (!context.dictionary[context.c]) {
          context.dictionary[context.c] = context.dictSize++;
          context.dictionaryToCreate[context.c] = true;
        }

        context.wc = context.w + context.c;
        if (context.dictionary[context.wc]) {
          context.w = context.wc;
        } else {
          produceW(context);
          // Add wc to the dictionary.
          context.dictionary[context.wc] = context.dictSize++;
          context.w = String(context.c);
        }
      }

      // Output the code for w.
      if (context.w !== "") {
        produceW(context);
      }

      // Mark the end of the stream
      writeBits(context.numBits, 2, context.data);

      // Flush the last char
      while (true) {
        context.data.val = (context.data.val << 1);
        if (context.data.position == 15) {
          context.data.string += String.fromCharCode(context.data.val);
          break;
        }
        else context.data.position++;
      }

      return context.data.string;
    }

    function writeBit(value, data) {
      data.val = (data.val << 1) | value;
      if (data.position == 15) {
        data.position = 0;
        data.string += String.fromCharCode(data.val);
        data.val = 0;
      } else {
        data.position++;
      }
    }

    function writeBits(numBits, value, data) {
      if (typeof(value) == "string")
        value = value.charCodeAt(0);
      for (var i = 0; i < numBits; i++) {
        writeBit(value & 1, data);
        value = value >> 1;
      }
    }

    function produceW(context) {
      if (context.dictionaryToCreate[context.w]) {
        if (context.w.charCodeAt(0) < 256) {
          writeBits(context.numBits, 0, context.data);
          writeBits(8, context.w, context.data);
        } else {
          writeBits(context.numBits, 1, context.data);
          writeBits(16, context.w, context.data);
        }
        decrementEnlargeIn(context);
        delete context.dictionaryToCreate[context.w];
      } else {
        writeBits(context.numBits, context.dictionary[context.w], context.data);
      }
      decrementEnlargeIn(context);
    }

    function decrementEnlargeIn(context) {
      context.enlargeIn--;
      if (context.enlargeIn == 0) {
        context.enlargeIn = Math.pow(2, context.numBits);
        context.numBits++;
      }
    }

    return output.replace(/=/g, "$").replace(/\//g, "-");;
  }


  decompressFromBase64(input:string) {
    var base64Characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    if (input == null) return "";
    var output = "",
      ol = 0,
      output_ = null,
      chr1, chr2, chr3,
      enc1, enc2, enc3, enc4,
      i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/=]/g, "");

    while (i < input.length) {

      enc1 = base64Characters.indexOf(input[i++]);
      enc2 = base64Characters.indexOf(input[i++]);
      enc3 = base64Characters.indexOf(input[i++]);
      enc4 = base64Characters.indexOf(input[i++]);

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      if (ol % 2 == 0) {
        output_ = chr1 << 8;

        if (enc3 != 64) {
          output += String.fromCharCode(output_ | chr2);
        }
        if (enc4 != 64) {
          output_ = chr3 << 8;
        }
      } else {
        output = output + String.fromCharCode(output_ | chr1);

        if (enc3 != 64) {
          output_ = chr2 << 8;
        }
        if (enc4 != 64) {
          output += String.fromCharCode(output_ | chr3);
        }
      }
      ol += 3;
    }


    function decompress(compressed) {

      if (compressed === '') {
        return null;
      }

      if (compressed === null || compressed === undefined) {
        return '';
      }

      var dictionary = {},
        next,
        enlargeIn = 4,
        dictSize = 4,
        numBits = 3,
        entry = "",
        result,
        i,
        w,
        c,
        errorCount = 0,
        data = {string: compressed, val: compressed.charCodeAt(0), position: 32768, index: 1};

      for (i = 0; i < 3; i += 1) {
        dictionary[i] = i;
      }

      next = readBits(2, data);
      switch (next) {
        case 0:
          c = String.fromCharCode(readBits(8, data));
          break;
        case 1:
          c = String.fromCharCode(readBits(16, data));
          break;
        case 2:
          return "";
      }
      dictionary[3] = c;
      w = result = c;
      while (true) {
        c = readBits(numBits, data);

        switch (c) {
          case 0:
            if (errorCount++ > 10000) return "Error";
            c = String.fromCharCode(readBits(8, data));
            dictionary[dictSize++] = c;
            c = dictSize - 1;
            enlargeIn--;
            break;
          case 1:
            c = String.fromCharCode(readBits(16, data));
            dictionary[dictSize++] = c;
            c = dictSize - 1;
            enlargeIn--;
            break;
          case 2:
            return result;
        }

        if (enlargeIn == 0) {
          enlargeIn = Math.pow(2, numBits);
          numBits++;
        }

        if (dictionary[c]) {
          entry = dictionary[c];
        } else {
          if (c === dictSize) {
            entry = w + w.charAt(0);
          } else {
            return null;
          }
        }
        result += entry;

        // Add w+entry[0] to the dictionary.
        dictionary[dictSize++] = w + entry.charAt(0);
        enlargeIn--;

        w = entry;

        if (enlargeIn == 0) {
          enlargeIn = Math.pow(2, numBits);
          numBits++;
        }
      }
    }

    function readBit(data) {
      var res = data.val & data.position;
      data.position >>= 1;
      if (data.position == 0) {
        data.position = 32768;
        data.val = data.string.charCodeAt(data.index++);
      }
      return res > 0 ? 1 : 0;
    }

    function readBits(numBits, data) {
      var res = 0;
      var maxpower = Math.pow(2, numBits);
      var power = 1;
      while (power != maxpower) {
        res |= readBit(data) * power;
        power <<= 1;
      }
      return res;
    }

    return decompress(output);
  }

}
