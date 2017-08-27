import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

@Injectable()
export class UtilService {


  constructor(private http: Http, private sqlite: SQLite) {

    console.log('memo!!!!!!!!!!!!!!!! util !!!!!!!!!!');

    this.sqlite.create({
      name: 'data.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {


        db.transaction(tx => {
          tx.executeSql('CREATE TABLE IF NOT EXISTS DemoTable (name, score)');
          tx.executeSql('INSERT INTO DemoTable VALUES (?,?)', ['Alice', 101]);
          tx.executeSql('INSERT INTO DemoTable VALUES (?,?)', ['Betty', 202]);
        }).catch(e => alert('transaction error1 : ' + e));


        /*db.transaction(tx => {
          tx.executeSql('SELECT count(*) AS mycount FROM DemoTable',{})
            .then((tx,rs)=>alert(rs.rows.item(0).mycount));
        }).catch(e => alert('transaction error2 : ' + e));*/

        db.executeSql('SELECT count(*) AS mycount FROM DemoTable', {})
          .then((rs) => {
            alert(rs.rows.item(0).mycount)
          })
          .catch(e => alert('transaction error2 : ' + e));


        /*db.executeSql('CREATE TABLE IF NOT EXISTS danceMoves(name VARCHAR(32))', {})
          .then(() => {
            console.log('Executed SQL');
            alert('성공?')
          })
          .catch(e => console.log(e));*/


      })
      .catch(e => console.log(e));

  }


  executeBL(path: string, param:any, success: Function) {
    var SERVICE_URL_PREFIX = 'http://cms.kanil.me/api/process/svc/';

    this.http.post(SERVICE_URL_PREFIX + path + '.json', param)
      .subscribe(
      res => {success(res.json())}, //For Success Response
      err => {console.error(err)} //For Error Response
    );

  }

}
