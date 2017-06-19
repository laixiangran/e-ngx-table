import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {EssenceNg2TableModule} from "../../src/essence-ng2-table.module";

@NgModule({
    imports: [
        BrowserModule,
		EssenceNg2TableModule
    ],
    declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
