import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
@Injectable()
export class UtilService {


  constructor(public http: Http) {
  }


  executeBL(path: string, success: Function) {
    var SERVICE_URL_PREFIX = 'http://cms.kanil.me/api/process/svc/';

    this.http.get(SERVICE_URL_PREFIX + path + '.json')
      .subscribe(
      res => {success(res.json())}, //For Success Response
      err => {console.error(err)} //For Error Response
    );

  }

}
