/**
 * Created by Hllinc on 2016-12-22 0022 11:34.
 * 表格数据模型类
 */
import { Condition } from "./condition";
import { PageInfo } from "./pageInfo";

export class TableDataModel {
    constructor(
        public items: any[],
        public pageList: number[],
        public totalCount: number,
        public pageCount: number,
        public pageSize: number,
        public currentPage: number,
        public startIndex: number,
        public endIndex: number
    ) {}
}
