/**
 * Created by laixiangran on 2017-06-22
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
    private searchInput: FormControl = new FormControl;
    private searchInputSubscription: Subscription;

    // 当前列对象
    currentColumn: any;

    // 控制列表全选复选框状态
    batchAllCheckStatus = false;

    // 用来合并配置的变量
    config: any;

    // 表格数据
    tableData: TableDataModel = null;

    // 搜索值
    searchText: string;

    // 已选择行
    selectedDatas: any[] = [];

    currSelectTime: any;

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

    /**
     * 表格初始化完成事件
     * @type {EventEmitter<any>}
     */
    @Output()
    private ready: EventEmitter<any> = new EventEmitter<any>(false);

    /**
     * 行选择事件
     * @type {EventEmitter<any>}
     */
    @Output()
    private rowSelect: EventEmitter<any> = new EventEmitter<any>(false);

    // 默认配置参数
    private defaultConfig: any = {
        serverParam: {
            serverUrl: "", // 服务地址
            token: "", // 令牌
            currentPage: 1, // 当前页
            pageSize: 10, // 每页显示页数
            conditions: [], // 查询条件
            orders: [], // 排序条件
            search: "", // 全局搜索值
            fileds: [] // 全局搜索对应字段
        },
        operateBtn: [],
        columns: {
            primaryKey: "id", // 主键
            filter: false, // 全列过滤
            batch: false, // 批量选择
            index: { // 序号列
                enabled: true, // 是否启用
                print: true // 是否可以打印
            }
        }
    };

    /**
     * 数列配置
     */
    private defaultItemsConfig: any = {
        label: "", // 表头标签
        colName: "", // 字段名
        visible: true, // 是否可见
        print: true, // 是否可以打印
        order: 'normal', // 排序，可取值：null, normal, asc, desc
        search: true, // 是否加入全局搜索
        width: null, // 单元格宽度
        cls: "text-center", // 单元格样式类
        style: null, // 单元格样式
        ellipsis: false, // 文字超出单元格是否显示...
        filterProp: { // 过滤条件
            enabled: false, // 是否启用
            type: "string", // 字段数据类型，可取值：string, date, select
            operator: "like", // 操作符号，可取值：like, eq
            value: null // 筛选的值
        },
        render: null, // 单元格格式化，如果是函数(value: any, obj: any) => {}，就显示函数返回的值，如果是数组，就显示按钮{text, cls, event}
        event: null // 单元格点击事件, 返回当前行的数据对象
    };

    constructor(private http: Http, public domSanitizer: DomSanitizer) {}

    ngOnInit() {
        // 订阅每列筛选输入框值变化事件
        this.filterInputSubscription = this.filterInput.valueChanges
            .debounceTime(300) // 延迟300ms
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

        // 订阅全局搜索输入框值变化事件
        this.searchInputSubscription = this.searchInput.valueChanges
            .debounceTime(300) // 延迟300ms
            .distinctUntilChanged() // 输入值没变化，不再发请求
            // .switchMap((value: any) => { // 保证请求顺序
            //     return this.getTableData();
            // })
            .subscribe(
                (value: any) => {
                    this.search();
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
        this.searchInputSubscription && this.searchInputSubscription.unsubscribe();
    }

    /**
     * 单元格点击事件
     * @param column
     * @param data
     */
    tdClick(column: any, data: any) {
        column.event && column.event(data);
    }

    /**
     * 按钮点击事件
     */
    btnClick(btn: any) {
        btn.event && btn.event();
    }

    /**
     * 创建表格
     */
    creatTable(): void {
        this.setServerParam();
        this.getDataSubscription = this.getTableData().subscribe(
            (serverData: any) => {
                if (serverData.code == 'ok') {
                    this.tableData = <TableDataModel> serverData.result;
                    this.ready.emit(this);
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
        let serverParam: any = this.deepCopyObj(this.config.serverParam);
        delete serverParam.serverUrl;
        return this.postData(this.config.serverParam.serverUrl, serverParam);
    }

    /**
     * post请求
     * @param url 请求路径
     * @param obj 请求body
     * @returns {Observable<ServerData>}
     */
    postData(url: string, obj: any = null): Observable<any> {
        let body = JSON.stringify(obj);
        let headers: Headers;
        if (this.config.serverParam.token) {
            headers = new Headers({
                'Content-Type': 'application/json',
                'URMS_LOGIN_TOKEN': this.config.serverParam.token
            });
        } else {
            headers = new Headers({
                'Content-Type': 'application/json'
            });
        }
        let options = new RequestOptions({headers: headers});
        return this.http.post(url, body, options)
            .map((res: Response) => {
                let body = res.json();
                return body || {};
            })
            .catch((error: any) => {
                let errMsg = (error.message) ? error.message :
                    error.status ? `${error.status} - ${error.statusText}` : 'Server error';
                return Observable.throw(errMsg);
            });
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
                        operator: col.filterProp.operator.toUpperCase()
                    });
                }
            }
            if (col.search && col.colName) {
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
            if (column.order === 'asc' || column.order === 'desc') {
                orders.push({
                    fieldName: column.colName,
                    operator: column.operator.toUpperCase()
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
                if (column.operator == 'asc') {
                    column.operator = 'desc';
                    orders[existIndex].operator = column.operator.toUpperCase();
                } else if (column.operator == 'desc') {
                    column.operator = 'normal';
                    orders.splice(existIndex, 1);
                }
            } else {
                column.operator = 'asc';
                orders.push({
                    fieldName: column.colName,
                    operator: column.operator.toUpperCase()
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
                operator: column.filterProp.operator.toUpperCase()
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
     * 选择日期
     * @param value 时间
     * @param column 行数据
     */
    dateChange(value: any, column: any) {
        this.filter(value, column);
    }

    /**
     * 全局搜索
     */
    search(): void {
        this.config.serverParam.search = this.searchText;
        this.refresh();
    }

    /**
     * 页面切换
     * @param event
     */
    pageChanged(event: any): void {
        this.refresh();
    };

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
     * 深度拷贝对象
     * @param obj
     * @returns {any}
     */
    deepCopyObj(obj: any): any {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * 复选框状态改变事件
     * @param data
     * @private
     */
    checkboxChangeEvent(data) {
        data.selected = !data.selected;
        let existIndex: number = 0;
        let isExist: boolean = this.selectedDatas.some((selectedData: any, index: number) => {
            if (selectedData[this.config.columns.primaryKey] === data[this.config.columns.primaryKey]) {
                existIndex = index;
            }
            return selectedData[this.config.columns.primaryKey] === data[this.config.columns.primaryKey];
        });
        if (data.selected) {
            if (!isExist) {
                let selectData: any = this.deepCopyObj(data);
                delete selectData.selected;
                this.selectedDatas.push(selectData);
            }
        } else {
            if (isExist) {
                this.selectedDatas.splice(existIndex, 1);
            }
        }
        this.rowSelect.emit(this.selectedDatas);
    }

    /**
     * 行选择事件
     * @param data
     */
    rowChangeEvent(data) {
        if (!this.config.columns.batch) {
            this.selectedDatas = [];
            this.tableData.items.forEach((item: any) => {
                if (data[this.config.columns.primaryKey] === item[this.config.columns.primaryKey]) {
                    item.selected = !item.selected;
                    if (item.selected) {
                        let selectData: any = this.deepCopyObj(item);
                        delete selectData.selected;
                        this.selectedDatas.push(selectData);
                    }
                } else {
                    item.selected = false;
                }
            });
            this.rowSelect.emit(this.selectedDatas);
        }
    }

    /**
     * 全选复选框状态改变事件
     * @param $event
     */
    checkboxAllChangeEvent($event) {
        let checked = $event.target.checked;
        for (let i = 0; i < this.tableData.items.length; i++) {
            this.tableData.items[i].selected = checked;
        }
        this.selectedDatas = checked ? this.deepCopyObj(this.tableData.items) : [];
        this.rowSelect.emit(this.selectedDatas);
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
     * 优化ngFor
     * @param index
     * @param data
     * @returns {any}
     */
    trackById(index: any, data: any): any {
        return data.id && data.c_id;
    }
}
