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
        serverParam: {
            serverUrl: "", // 服务地址
            currentPage: 1, // 当前页
            pageSize: 5, // 每页显示页数
            conditions: [], // 查询条件
            orders: [], // 排序条件
            search: "", // 全局搜索值
            fileds: [] // 全局搜索对应字段
        },
        columns: {
            primaryKey: "id", // 主键
            filter: true, // 全列过滤
            batch: true, // 批量选择
            index: true, // 序号
        }
    };

    /**
     * 数列配置
     */
    private defaultItemsConfig: any = {
        label: "",
        colName: "",
        visible: true,
        order: 'NORMAL',
        search: true,
        width: null,
        cls: "text-center",
        style: null,
        ellipsis: false,
        filterProp: {
            enabled: true,
            type: "string",
            compare: "LIKE",
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
            // .switchMap((value: any) => { // 保证请求顺序
            //     return this.getTableData();
            // })
            .subscribe(
                (value: any) => {
                    this.filter(value, this.currentColumn);
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
        this.setServerParam();
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
        let serverParam: any = JSON.parse(JSON.stringify(this.config.serverParam));
        delete serverParam.serverUrl;
        return this.postData(this.config.serverParam.serverUrl, serverParam);
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
     * 设置查询参数
     */
    setServerParam() {
        this.config.columns.items.forEach((col: any) => {
            this.setOrders(col, true);
            if (col.filterProp && col.filterProp.enabled) {
                if (col.filterProp.type != 'select' && col.filterProp.value) {
                    this.config.serverParam.conditions.push({
                        fieldName: col.colName,
                        value: col.filterProp.value,
                        operator: col.filterProp.compare
                    });
                }
            }
            if (col.search) {
                this.config.serverParam.fileds.push(col.colName);
            }
        });
    }

    /**
     * 设置当前列对象
     * @param column
     */
    setCurrentColumn(column: any) {
        this.currentColumn = column;
    }

    /**
     * 设置排序条件
     * @param column 列对象
     * @param isFirst 是否第一次设置
     */
    setOrders(column: any, isFirst: boolean = false): void {
        let orders: any[] = this.config.serverParam.orders;
        if (isFirst) {
            column.operator = column.order;
            if (column.order === 'ASC' || column.order === 'DESC') {
                orders.push({
                    fieldName: column.colName,
                    operator: column.operator
                });
            }
        } else {
            let existIndex: number = 0;
            let isExist: boolean = orders.some((order: any, index: number) => {
                if (order.fieldName === column.colName) {
                    existIndex = index;
                }
                return order.fieldName === column.colName;
            });
            if (isExist) {
                if (column.operator == 'ASC') {
                    column.operator = 'DESC';
                    orders[existIndex].operator = column.operator;
                } else if (column.operator == 'DESC') {
                    column.operator = 'NORMAL';
                    orders.splice(existIndex, 1);
                }
            } else {
                column.operator = 'ASC';
                orders.push({
                    fieldName: column.colName,
                    operator: column.operator
                });
            }
        }
    }

    /**
     * 排序方法
     * @param column
     * @private
     */
    sort(column: any): void {
        if (column.order) {
            this.setOrders(column);
            this.refresh();
        }
    }

    setFilter(value: any, column: any): void {
        let conditions: any[] = this.config.serverParam.conditions,
            existIndex: number = 0;
        let isExist: boolean = conditions.some((condition: any, index: number) => {
            if (condition.fieldName === column.colName) {
                existIndex = index;
            }
            return condition.fieldName === column.colName;
        });
        if (isExist) {
            conditions[existIndex].value = value.trim();
        } else {
            conditions.push({
                fieldName: column.colName,
                value: value.trim(),
                operator: column.filterProp.compare
            });
        }
    }

    /**
     * 过滤方法
     * @param value 筛选的值
     * @param column 列设置项
     * @private
     */
    filter(value: any, column: any): void {
        this.setFilter(value, column);
        this.refresh();
    }

    /**
     * 全局搜索
     */
    search(): void {

    }

    /**
     * 上一页方法
     * @private
     */
    prePage(): void {
        this.config.serverParam.currentPage--;
        this.refresh();
    }

    /**
     * 下一页方法
     * @private
     */
    nextPage(): void {
        this.config.serverParam.currentPage++;
        this.refresh();
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
            for (let i = 0; i < this.tableData.items.length; i++) {
                if (!this.tableData.items[i].selected) {
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
        for (let i = 0; i < this.tableData.items.length; i++) {
            this.tableData.items[i].selected = checked;
        }
    }

    /**
     * 刷新列表数据
     */
    refresh(): void {
        this.getDataSubscription = this.getTableData().subscribe(
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

    /**
     * 获取选中数据
     */
    getSelectedItems(): any[] {
        let result = [];
        for (let i = 0; i < this.tableData.items.length; i++) {
            if (this.tableData.items[i].selected) {
                result.push(this.tableData.items[i]);
            }
        }
        return result;
    }

    trackById(index: any, data: any): any {
        return data.id;
    }
}
