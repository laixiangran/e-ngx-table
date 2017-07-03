/**
 * Created by Hllinc on 2016-12-21 17:23.
 */

import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { FormControl } from "@angular/forms";
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/switchMap";
import * as _ from "lodash";

import { TableDataModel } from "./model/tableDataModel";

@Component({
    selector: 'essence-ng2-table',
    templateUrl: './essence-ng2-table.component.html',
    styleUrls: ['./essence-ng2-table.component.scss']
})

export class EssenceNg2TableComponent implements OnInit, OnDestroy {

    private getDataSubscription: Subscription;
    private filterInput: FormControl = new FormControl;
    private filterInputSubscription: Subscription;

    currentColumn: any;

    // 控制列表全选复选框状态
    batchAllCheckStatus = false;

    // 用来合并配置的变量
    config: any;

    // 表格数据
    tableData: TableDataModel = null;

    /**
     * 属性设置
     * @param config
     */
    @Input()
    set option(config: any) {
        this.config = _.merge({}, this.defaultConfig, config);
        if (this.config.columns.items) {
            let items: any[] = this.config.columns.items.map((item: any) => {
                return _.merge({}, this.defaultItemsConfig, item);
            });
            this.config.columns.items = items;
            this.creatTable();
        } else {
            throw `columns.items is undefined - 缺少数据列配置，请配置。`;
        }
    }

    get option(): any {
        return this.config;
    }

    /**
     * 表格初始化完成事件
     * @type {EventEmitter<any>}
     */
    @Output()
    private ready: EventEmitter<any> = new EventEmitter<any>(false);

    // 默认配置参数
    private defaultConfig: any = {
        serverUrl: "",
        serverParam: {
            pageInfo: {
                currentPageNum: 1,
                pageSize: 10
            },
            condition: {
                where: null,
                order: null
            }
        },
        columns: {
            primaryKey: "c_id",
            filter: true,
            batch: false,
            index: true
        }
    };

    /**
     * 数列配置
     */
    private defaultItemsConfig: any = {
        label: "",
        colName: "",
        visible: true,
        order: true,
        width: null,
        cls: "text-center",
        style: null,
        ellipsis: false,
        filterProp: {
            enabled: true,
            type: "string",
            compare: "like",
            value: null
        },
        render: null
    };

    constructor(private http: Http, public domSanitizer: DomSanitizer) {}

    ngOnInit() {
        // 订阅每列筛选输入框值变化事件
        this.filterInputSubscription = this.filterInput.valueChanges
            .debounceTime(500) // 延迟500ms
            .distinctUntilChanged() // 输入值没变化，不再发请求
            .switchMap((value: any) => { // 保证请求顺序
                this.currentColumn.filterProp.value = value.trim();
                this.setSortVal();
                this.setFilterVal();
                return this.getTableData();
            })
            .subscribe(
                (serverData: any) => {
                    if (serverData.code == 'ok') {
                        this.tableData = <TableDataModel> serverData.result;
                    }
                },
                (error: any) => {
                    throw error;
                }
            );
    }

    ngOnDestroy() {
        this.tableData = null;
        this.getDataSubscription && this.getDataSubscription.unsubscribe();
        this.filterInputSubscription && this.filterInputSubscription.unsubscribe();
    }

    /**
     * 创建表格
     */
    creatTable(): void {
        this.setSortVal();
        this.setFilterVal();
        this.getDataSubscription = this.getTableData().subscribe(
            (serverData: any) => {
                if (serverData.code == 'ok') {
                    !this.tableData && this.ready.emit(); // ready事件发送一次
                    this.tableData = <TableDataModel> serverData.result;
                }
            },
            (error: any) => {
                throw error;
            }
        );
    }

    /**
     * 获取表格数据
     * @returns {Observable<any>}
     */
    getTableData(): Observable<any> {
        return this.postData(this.config.serverUrl, this.config.serverParam);
    }

    /**
     * post请求
     * @param url 请求路径
     * @param obj 请求body
     * @param isDev 是否开发模式，默认false
     * @returns {Observable<ServerData>}
     */
    postData(url: string, obj: any = null, isDev: boolean = false): Observable<any> {
        let body = JSON.stringify(obj);
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});

        return this.http.post(url, body, options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    /**
     * 提取数据
     * @param res Response
     * @returns {any|{}}
     */
    private extractData(res: Response): any {
        let body = res.json();
        return body || {};
    }

    /**
     * 请求错误
     * @param error 错误对象
     * @returns {ErrorObservable}
     */
    private handleError(error: any): Observable<any> {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        return Observable.throw(errMsg);
    }

    /**
     * 排序方法
     * @param column
     * @private
     */
    sort(column: any): void {
        if (column.order) {
            if (column.order === 'asc') {
                column.order = 'desc'
            } else if (column.order === 'desc') {
                column.order = 'sort';
            } else {
                column.order = 'asc';
            }
            this.creatTable();
        }
    }

    /**
     * 设置排序条件
     */
    setSortVal(): void {
        let orders: any = [];
        for (let i = 0; i < this.config.columns.items.length; i++) {
            let col = this.config.columns.items[i];
            if (col.order === 'asc' || col.order === 'desc') {
                orders.push({
                    paramKey: col.colName,
                    paramValue: col.order
                });
            }
        }
        this.config.serverParam.condition.order = orders;
    }

    setCurrentColumn(column: any) {
        this.currentColumn = column;
    }

    /**
     * 过滤方法
     * @param e 事件
     * @param column 列设置项
     * @private
     */
    filter(e: any, column: any): void {
        let value = e.target.value;
        column.filterProp.value = value.trim();
        this.creatTable();
    }

    /**
     * 设置过滤条件
     */
    setFilterVal(): void {
        let filters: any = [];
        for (let i = 0; i < this.config.columns.items.length; i++) {
            let col = this.config.columns.items[i];
            if (col.filterProp && col.filterProp.enabled) {
                if (col.filterProp.type != 'select') {
                    if (col.filterProp.value !== undefined) {
                        if (col.filterProp.value === null) {
                            if (col.filterProp.compare === 'is') {
                                filters.push({
                                    conn: 'and',
                                    paramCompare: col.filterProp.compare,
                                    paramType: col.filterProp.type,
                                    paramKey: col.colName,
                                    paramKeyAlias: col.colAlias,
                                    paramValue: (col.filterProp.compare === 'like' ? '%' + col.filterProp.value + '%' : col.filterProp.value)
                                });
                            }
                        } else if ((col.filterProp.value || col.filterProp.value == 0) && col.filterProp.value !== '') {
                            filters.push({
                                conn: 'and',
                                paramCompare: col.filterProp.compare,
                                paramType: col.filterProp.type,
                                paramKey: col.colName,
                                paramKeyAlias: col.colAlias,
                                paramValue: (col.filterProp.compare === 'like' ? '%' + col.filterProp.value + '%' : col.filterProp.value)
                            });
                        }
                    }
                }
            }
        }
        this.config.serverParam.condition.where = filters;
    }

    /**
     * 上一页方法
     * @private
     */
    prePage(): void {
        this.config.serverParam.pageInfo.currentPageNum--;
        this.creatTable();
    }

    /**
     * 下一页方法
     * @private
     */
    nextPage(): void {
        this.config.serverParam.pageInfo.currentPageNum++;
        this.creatTable();
    }

    /**
     * 跳转页方法
     * @param num
     * @private
     */
    toPage(num: number): void {
        if (this.config.serverParam.pageInfo.currentPageNum !== num && num !== -1) {
            this.config.serverParam.pageInfo.currentPageNum = num;
            this.config.serverParam.pageInfo.beginRecord = this.config.serverParam.pageInfo.pageSize * (num - 1);
            this.creatTable();
        }
    }

    /**
     * 数字转数组方法（为了迁就ngFor）
     * @param n
     * @returns {Array}
     * @private
     */
    numberArray(n: number) {
        let result = [];
        for (let i: number = 0; i < n; i++) {
            result.push(i + 1);
        }
        return result;
    }

    /**
     * 判断是否为方法
     * @param param
     * @returns {boolean}
     */
    isFunction(param: any): boolean {
        return typeof param === 'function';
    }

    /**
     * 判断是否为数组
     * @param param
     * @returns {boolean}
     */
    isArray(param: any): boolean {
        return Array.isArray(param);
    }

    /**
     * 生成分页按钮上的文字
     * @param index
     * @param currentPageNum
     * @param sumPageNum
     * @returns {string}
     */
    generateForText(index: number, currentPageNum: number, sumPageNum: number): string {
        if (index === 1 || index === sumPageNum || currentPageNum + 1 === index || currentPageNum - 1 === index || currentPageNum === index) {
            return index.toString();
        } else {
            return '...';
        }
    }

    /**
     * 生成分页按钮
     * @param index
     * @param currentPageNum
     * @param sumPageNum
     * @returns {boolean}
     */
    generateForButton(index: number, currentPageNum: number, sumPageNum: number): boolean {
        if ((index - currentPageNum > 2 || currentPageNum - index > 2) && index != 1 && index != sumPageNum) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * 复选框状态改变事件
     * @param $event
     * @param data
     * @private
     */
    checkboxChangeEvent($event, data) {
        data.selected = $event.target.checked;
        if (data.selected) {
            let allStatus = true;
            for (let i = 0; i < this.tableData.pageInfo.items.length; i++) {
                if (!this.tableData.pageInfo.items[i].selected) {
                    allStatus = false;
                    break;
                }
            }
            this.batchAllCheckStatus = allStatus;
        } else {
            this.batchAllCheckStatus = false;
        }
    }

    /**
     * 全选复选框状态改变事件
     * @param $event
     * @private
     */
    checkboxAllChangeEvent($event) {
        let checked = $event.target.checked;
        for (let i = 0; i < this.tableData.pageInfo.items.length; i++) {
            this.tableData.pageInfo.items[i].selected = checked;
        }
    }

    /**
     * 刷新列表数据
     */
    refresh(): void {
        this.creatTable();
    }

    /**
     * 获取选中数据
     */
    getSelectedItems(): any[] {
        let result = [];
        for (let i = 0; i < this.tableData.pageInfo.items.length; i++) {
            if (this.tableData.pageInfo.items[i].selected) {
                result.push(this.tableData.pageInfo.items[i]);
            }
        }
        return result;
    }

    trackById(index: any, data: any): any {
        return data.c_id;
    }
}
