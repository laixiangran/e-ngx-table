/**
 * Created by laixiangran on 2017-06-22
 */

import { NgModule } from "@angular/core";
import { EssenceNg2TableComponent } from "./essence-ng2-table.component";
import { CommonModule } from "@angular/common";
import { HttpModule } from "@angular/http";
import { ReactiveFormsModule } from "@angular/forms";
import { EssenceNg2PaginationModule } from "essence-ng2-pagination";

@NgModule({
    imports: [
        CommonModule,
        HttpModule,
        ReactiveFormsModule,
        EssenceNg2PaginationModule
    ],
    declarations: [EssenceNg2TableComponent],
    exports: [EssenceNg2TableComponent]
})
export class EssenceNg2TableModule {

}
