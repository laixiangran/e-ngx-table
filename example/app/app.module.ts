import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ENgxTableModule } from '../../src/e-ngx-table.module';

@NgModule({
	imports: [
		BrowserModule,
		ENgxTableModule
	],
	declarations: [
		AppComponent
	],
	bootstrap: [AppComponent]
})
export class AppModule {
}
