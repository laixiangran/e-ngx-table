/**
 * Created by laixiangran on 2017-06-22
 */

import { NgModule } from "@angular/core";
import { EssenceNg2TableComponent } from "./essence-ng2-table.component";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { EssenceNg2PaginationModule } from "essence-ng2-pagination";
import { EssenceNg2DatetimepickerModule } from "essence-ng2-datetimepicker";
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    imports: [
        CommonModule,
		HttpClientModule,
        ReactiveFormsModule,
        EssenceNg2PaginationModule,
        EssenceNg2DatetimepickerModule
    ],
    declarations: [EssenceNg2TableComponent],
    exports: [EssenceNg2TableComponent]
})
export class EssenceNg2TableModule {

}
