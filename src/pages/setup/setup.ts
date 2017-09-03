import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {GooglePlus} from 'ionic-native';
import { UtilService } from '../../service/memo.util';
import { InAppPurchase } from '@ionic-native/in-app-purchase';


/**
 * Generated class for the SetupPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-setup',
  templateUrl: 'setup.html',
})
export class SetupPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private viewCtrl: ViewController, private util: UtilService, private iap: InAppPurchase ) {
  }

  private setupInfo = {
    user: {
      EMAIL: '',
      ENABLE_SYNC : false
    }
  };

  ionViewDidLoad() {
    console.log('ionViewDidLoad SetupPage');
    this.setupInfo.user = this.navParams.data;
  }

  updateSync(){
    console.log(this.setupInfo.user.ENABLE_SYNC);

    if (this.setupInfo.user.ENABLE_SYNC) {
      if (!this.setupInfo.user.EMAIL) {


        this.googleLogin(res => {
          var email = res.email;
          console.log('upgradePro success : ' + email);

          this.util.selectServerUser(email, res=>{
            if(!res.USR_KEY) {


              this.iap
                .getProducts(['memo.sync01'])
                .then((products) => {
                  console.log('getProducts success : ' + JSON.stringify(products));
                  //  [{ productId: 'com.yourapp.prod1', 'title': '...', description: '...', price: '...' }, ...]

                  this.iap
                    .buy('memo.sync01')
                    .then(data => {
                      //alert('구매 성공!');
                      //this.iap.consume(data.productType, data.receipt, data.signature);

                      this.util.insertServerUser(email, 'G', res=>{
                        this.util.updateLocalUser({
                          EMAIL: email,
                          LOGIN_TP: 'G',
                          USR_KEY: res.USR_KEY,
                          ENABLE_SYNC: true
                        }, res => {
                          console.log('updateSync true');
                          this.setupInfo.user.ENABLE_SYNC = true;
                        });
                      });

                    })
                    .then(() => {
                      //alert('product was successfully consumed!')
                    }).catch(err => {
                    alert('구매중 오류가 발생했습니다.\n' + JSON.stringify(err));
                    this.setupInfo.user.ENABLE_SYNC = false;
                  });

                })
                .catch((err) => {
                  alert('구매중 오류가 발생했습니다.\n' + JSON.stringify(err));
                  this.setupInfo.user.ENABLE_SYNC = false;
                });


              /*if(confirm('결재 고고?')) {
                this.util.insertServerUser(email, 'G', res=>{
                  this.util.updateLocalUser({
                    EMAIL: email,
                    LOGIN_TP: 'G',
                    USR_KEY: res.USR_KEY,
                    ENABLE_SYNC: true
                  }, res => {
                    console.log('updateSync true');
                    this.setupInfo.user.ENABLE_SYNC = true;
                  });
                });

              }else {
                this.setupInfo.user.ENABLE_SYNC = false;
              }*/

            }else {
              this.util.updateLocalUser({
                EMAIL: email,
                LOGIN_TP: 'G',
                USR_KEY: res.USR_KEY,
                ENABLE_SYNC: true
              }, res => {
                console.log('updateSync true')
              });
            }
          });


        });
      }else {
        this.util.updateLocalUser({
          ENABLE_SYNC: true
        }, res => {
          console.log('updateSync true')
        });
      }
    }else {
      this.util.updateLocalUser({
        ENABLE_SYNC: false
      }, res => {
        console.log('updateSync false')
      });
    }

  }

  upgradePro() {

    //TODO 인앱 결제 추가.
    this.googleLogin(res => {

    });

  }

  checkPro() {

  }

  cancel() {
    this.viewCtrl.dismiss();
  }


  googleLogin(success: Function) {
    GooglePlus.login({}).then((res) => {
      console.log("success : " + JSON.stringify(res));
      success(res);
    }, (err) => {
      alert("Google Login error : " + err);
    });

    /*
    *
    * GooglePlus.logout().then(() => {
            console.log("logged out");
        });
    *
    * */
  }

}
