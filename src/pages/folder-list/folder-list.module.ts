import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FolderListPage } from './folder-list';

@NgModule({
  declarations: [
    FolderListPage,
  ],
  imports: [
    IonicPageModule.forChild(FolderListPage),
  ],
})
export class FolderListPageModule {}
