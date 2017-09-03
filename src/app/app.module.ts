import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, LOCALE_ID } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

import { FolderListPage } from '../pages/folder-list/folder-list';
import { MemoListPage } from '../pages/memo-list/memo-list';
import { PanelPage } from '../pages/panel/panel';

import { FolderSelectPage } from '../pages/folder-select/folder-select';
import { SetupPage } from '../pages/setup/setup';

import { HttpModule } from '@angular/http';
import { UtilService } from '../service/memo.util';
import { SQLite } from '@ionic-native/sqlite';

import { SearchPipe } from '../pipe/search.pipe';

import { Keyboard } from '@ionic-native/keyboard';


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    FolderListPage,
    MemoListPage,
    PanelPage,
    FolderSelectPage,
    SetupPage,
    SearchPipe
  ],
  imports: [
    HttpModule,
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      backButtonText: ''
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    FolderListPage,
    MemoListPage,
    PanelPage,
    FolderSelectPage,
    SetupPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UtilService,
    SQLite,
    Keyboard
    //{ provide: LOCALE_ID, useValue: "ko-KR" }, //replace "en-US" with your locale
  ]
})
export class AppModule {}
