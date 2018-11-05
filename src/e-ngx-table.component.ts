/**
 * Created by laixiangran on 2017-06-22
 */

import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/throw';
import * as _ from 'lodash';

import { TableDataModel } from './model/tableDataModel';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

@Component({
	selector: 'e-ngx-table',
	templateUrl: './e-ngx-table.component.html',
	styleUrls: ['./e-ngx-table.component.scss']
})
export class ENgxTableComponent implements OnInit, OnDestroy {
	private getDataSubscription: Subscription;
	private searchInputSubscription: Subscription;

	searchInput: FormControl = new FormControl;

	// 表格是否已经加载完成（第一次）
	tableIsloaded: boolean = false;

	// 用来合并配置的变量
	config: any;

	// 表格数据
	tableData: TableDataModel = null;

	// 搜索值
	searchText: string;

	// 已选择行
	selectedDatas: any[] = [];

	// 搜索/排序中
	isSearching: boolean = false;

	// 复杂筛选列
	complexSearchItems: any[] = [];

	// 复杂筛选条件
	conditionList: any[] = [];

	// 显示高级搜索条件与否
	showComplexSearch: boolean = false;

	// 日期组件配置
	options: any = {
		format: 'YYYY-MM-DD'
	};
	// 传进来的conditions
	tableContions: any;

	/**
	 * 属性设置
	 * @param config
	 */
	@Input()
	set option(config: any) {
		this.config = _.merge({}, this.defaultConfig, config);
		this.tableContions = this.config.serverParam.conditions; // 将传进来的conditons保存起来
		if (this.config.columns.items) {
			let items: any[] = this.config.columns.items.map((item: any) => {
				return _.merge({}, this.defaultItemsConfig, item);
			});
			this.config.columns.items = items;
			this.setServerParam();
			if (this.config.showComplexSearch) {
				this.setComplexSearchItem();
			}
			if (!this.tableIsloaded) {
				this.ready.emit(this);
			} else {
				this.refresh();
			}
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

	/**
	 * 表格刷新完成事件
	 * @type {EventEmitter<any>}
	 */
	@Output()
	private tableRefresh: EventEmitter<any> = new EventEmitter<any>(false);

	// 默认配置参数
	private defaultConfig: any = {
		serverParam: {
			serverUrl: '', // 服务地址
			token: '', // 令牌
			currentPage: 1, // 当前页
			pageSize: 10, // 每页显示页数
			conditions: [], // 查询条件
			orders: [], // 排序条件
			search: '', // 全局搜索值
			fileds: [] // 全局搜索对应字段
		},
		operateBtn: [],
		showGlobalSearch: true,
		showComplexSearch: false,
		columns: {
			primaryKey: 'id', // 主键
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
		label: '', // 表头标签
		colName: '', // 字段名
		visible: true, // 是否可见
		print: true, // 是否可以打印
		order: null, // 排序，可取值：null, normal, asc, desc
		search: true, // 是否加入全局搜索
		width: null, // 单元格宽度
		cls: 'text-center', // 单元格样式类
		style: null, // 单元格样式
		ellipsis: false, // 文字超出单元格是否显示...
		complexSearch: {
			enable: false,
			type: 'string',
		}, // 是否可以进行复杂筛选
		type: 'string',
		filterProp: { // 过滤条件
			enabled: false, // 是否启用
			type: 'string', // 字段数据类型，可取值：string, date, select
			operator: 'like', // 操作符号，可取值：like, eq
			value: null // 筛选的值
		},
		render: null, // 单元格格式化，如果是函数(value: any, obj: any) => {}，就显示函数返回的值，如果是数组，就显示按钮{text, cls, event, exist}
		event: null // 单元格点击事件, 返回当前行的数据对象
	};

	constructor(private http: HttpClient, public domSanitizer: DomSanitizer) {}

	ngOnInit() {
		if (this.config.showGlobalSearch) {
			// 订阅全局搜索输入框值变化事件
			this.searchInputSubscription = this.searchInput.valueChanges
				.debounceTime(300) // 延迟300ms
				.distinctUntilChanged() // 输入值没变化，不再发请求
				.switchMap((value: any) => { // 保证请求顺序
					this.isSearching = true;
					this.config.serverParam.search = value;
					return this.getDataServer();
				})
				.subscribe((serverData: any) => {
						if (serverData.code === 'ok') {
							this.handlerTableData(serverData.result);
						} else {
							throw new Error(serverData.info);
						}
					},
					(error: any) => {
						throw new Error(error);
					}
				);
		} else {
			this.getTableData();
		}
	}

	ngOnDestroy() {
		this.tableData = null;
		this.getDataSubscription && this.getDataSubscription.unsubscribe();
		this.searchInputSubscription && this.searchInputSubscription.unsubscribe();
	}

	/**
	 * 高级搜索按钮点击事件
	 */
	searchClick() {
		this.showComplexSearch = !this.showComplexSearch;
	}

	/**
	 * 添加条件按钮点击事件
	 */
	addCondition() {
		this.conditionList.push({
			fieldName: this.complexSearchItems[0].colName,
			operator: 'EQ',
			value: '',
			type: this.complexSearchItems[0].type,
			data: this.complexSearchItems[0].type === 'select' ? this.complexSearchItems[0].data : null
		});
	}

	/**
	 * colName值变化
	 * @param $event
	 * @param item
	 */
	optionChange($event, item) {
		item.fieldName = $event.target.value;
		this.complexSearchItems.forEach((curItem) => {
			if (curItem.colName === $event.target.value) {
				item.type = curItem.type;
				item.data = item.type === 'select' ? curItem.data : null;
			}
		});
	}

	operatorChange($event, item) {
		item.operator = $event.target.value;
	}

	/**
	 * 搜索按钮点击事件
	 */
	search() {
		const conditions = [];
		this.conditionList.forEach((ite) => {
			if (ite.value) {
				conditions.push({fieldName: ite.fieldName, operator: ite.operator, value: ite.value});
			}
		});
		if (this.tableContions.length > 0) {
			this.tableContions.forEach((con) => {
				conditions.push(con);
			})
		}
		this.config.serverParam.conditions = conditions;
		this.getTableData();
	}

	/**
	 * 关闭复杂筛选
	 */
	closeComplexSearch() {
		this.showComplexSearch = false;
		this.conditionList = [];
		const conditions = [];
		if (this.tableContions.length > 0) {
			this.tableContions.forEach((con) => {
				conditions.push(con);
			})
		}
		this.config.serverParam.conditions = conditions;
		this.getTableData();
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
	 * 获取表格数据
	 */
	getTableData() {
		this.getDataServer().subscribe((serverData: any) => {
			if (serverData.code === 'ok') {
					this.handlerTableData(serverData.result);
				} else {
					throw new Error(serverData.info);
				}
			}, (error: any) => {
				throw new Error(error);
			}
		);
	}

	/**
	 * 处理表格数据
	 */
	handlerTableData(tableData: TableDataModel) {
		tableData.items.forEach((dataItem: any) => {
			dataItem.tdContent = {};
			this.config.columns.items.forEach((item: any) => {
				dataItem.tdContent[item.colName] = this.domSanitizer.bypassSecurityTrustHtml(dataItem[item.colName]);
				if (item.render && this.isFunction(item.render)) {
					dataItem.tdContent[item.colName] = this.domSanitizer.bypassSecurityTrustHtml(item.render(dataItem[item.colName], dataItem));
				} else if (this.isArray(item.render)) {
					item.render.forEach((render: any) => {
						render.isShow = !this.isFunction(render.exist) || render.exist(dataItem);
					});
				}
			});
		});
		this.tableData = tableData;
		this.isSearching = false;
		if (this.tableIsloaded) {
			this.tableRefresh.emit(this);
		}
		this.tableIsloaded = true;
	}

	/**
	 * 获取表格数据服务
	 * @returns {Observable<any>}
	 */
	getDataServer(): Observable<any> {
		let serverParam: any = this.deepCopyObj(this.config.serverParam);
		delete serverParam.serverUrl;
		delete serverParam.token;
		return this.post(this.config.serverParam.serverUrl, serverParam);
	}

	/**
	 * 设置查询参数
	 */
	setServerParam() {
		this.config.columns.items.forEach((col: any) => {
			this.setOrders(col, true);
			if (col.filterProp && col.filterProp.enabled) {
				if (col.filterProp.type !== 'select' && col.filterProp.value) {
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
	 * 设置复杂筛选的列
	 */
	setComplexSearchItem() {
		this.config.columns.items.forEach((col: any) => {
			if (col.complexSearch.enable && col.colName) {
				if (col.complexSearch.type === 'select') {
					this.complexSearchItems.push({
						label: col.label,
						colName: col.colName,
						type: 'select',
						data: col.complexSearch.data
					})
				} else {
					this.complexSearchItems.push({
						label: col.label,
						colName: col.colName,
						type: col.complexSearch.type
					})
				}
			}
		});
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
			this.isSearching = true;
			this.setOrders(column);
			this.refresh();
		}
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
		this.getTableData();
	}

	/**
	 * 优化ngFor
	 * @param index
	 * @param data
	 * @returns {any}
	 */
	trackById(index: any, data: any): any {
		return data[this.config.columns.primaryKey];
	}

	/**
	 * post请求
	 * @param url 请求路径
	 * @param body 请求body
	 * @returns {Observable<any>}
	 */
	post(url: string, body: any = null): Observable<any> {
		let headers: HttpHeaders = new HttpHeaders({
			'Content-Type': 'application/json',
			'Authorization': this.config.serverParam.token,
			'URMS_LOGIN_TOKEN': this.config.serverParam.token
		});
		let options = {
			headers: headers
		};
		return this.http.post(url, body && JSON.stringify(body), options).catch((error: HttpErrorResponse) => {
			let errMsg = (error.message) ? error.message :
				error.status ? `${error.status} - ${error.statusText}` : 'Server error';
			return Observable.throw(errMsg);
		});
	}

	/**
	 * 操作列按钮点击
	 * @param {MouseEvent} evt
	 * @param button
	 * @param data
	 */
	handlerBtnClick(evt: MouseEvent, button: any, data: any) {
		evt.stopPropagation();
		button.event(data);
	}
}
