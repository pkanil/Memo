import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MemoListPage } from './memo-list';

@NgModule({
  declarations: [
    MemoListPage,
  ],
  imports: [
    IonicPageModule.forChild(MemoListPage),
  ],
})
export class MemoListPageModule {}
