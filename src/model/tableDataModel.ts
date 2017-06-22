/**
 * Created by laixiangran on 2017-06-22
 * 表格数据模型类
 */

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
