import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BillUploaderComponent } from './bill-uploader/bill-uploader.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [BillUploaderComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild([
    { path: '', component: BillUploaderComponent }
  ])]
})
export class BillsModule { }
