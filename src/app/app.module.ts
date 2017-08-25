import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

import { FolderListPage } from '../pages/folder-list/folder-list';
import { MemoListPage } from '../pages/memo-list/memo-list';
import { HttpModule } from '@angular/http';

import { UtilService } from '../service/memo.util';



@NgModule({
  declarations: [
    MyApp,
    HomePage,
    FolderListPage,
    MemoListPage
  ],
  imports: [
    HttpModule,
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    FolderListPage,
    MemoListPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UtilService
  ]
})
export class AppModule {}
