import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FolderSelectPage } from './folder-select';

@NgModule({
  declarations: [
    FolderSelectPage,
  ],
  imports: [
    IonicPageModule.forChild(FolderSelectPage),
  ],
})
export class FolderSelectPageModule {}
