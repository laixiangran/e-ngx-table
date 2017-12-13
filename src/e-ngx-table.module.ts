/**
 * Created by laixiangran on 2017-06-22
 */

import { NgModule } from '@angular/core';
import { ENgxTableComponent } from './e-ngx-table.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ENgxPaginationModule } from 'e-ngx-pagination';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		ReactiveFormsModule,
		ENgxPaginationModule
	],
	declarations: [ENgxTableComponent],
	exports: [ENgxTableComponent]
})
export class ENgxTableModule {

}
