/**
 * Created by Hllinc on 2016-12-21 0021 17:20.
 */
import { NgModule } from "@angular/core";
import { EssenceNg2TableComponent } from "./essence-ng2-table.component";
import { CommonModule } from "@angular/common";
import { HttpModule } from "@angular/http";

@NgModule({
    imports: [
        CommonModule,
        HttpModule
    ],
    declarations: [EssenceNg2TableComponent],
    exports: [EssenceNg2TableComponent]
})

export class EssenceNg2TableModule {

}
