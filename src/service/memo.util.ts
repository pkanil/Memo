import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
@Injectable()
export class UtilService {


  constructor(public http: Http) {
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
