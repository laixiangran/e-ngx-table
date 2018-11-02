import { Component, ViewChild } from '@angular/core';
import { environment } from '../environments/environment';
import { Sys } from './utils/sys';
import { ENgxTableComponent } from '../../src';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	@ViewChild(ENgxTableComponent) table: ENgxTableComponent;
	option: any = {
		serverParam: {
			serverUrl: `${environment.serverHost}/SysLogController/getSysLogListPage`,
			token: 'AA87FE87EB7E90CE_117167E7B95C5682C836AFFD9845C6C97D95D44CEA66DC5705E63CD08F603A6500CF493097DD30FA'
		},
		operateBtn: [{
			text: '添加',
			cls: 'btn-success',
			event: () => {
				console.log(this);
			}
		}],
		showGlobalSearch: true,
		showComplexSearch: true,
		columns: {
			primaryKey: 'id', // （一般要配置，如果错了rowSelect事件会失效）
			items: [
				{
					label: '操作时间',
					colName: 'date',
					search: false,
					render: (value) => {
						return value ? Sys.dateFormat(value, 'yyyy-MM-dd') : '/';
					}
				}, {
					label: '描述信息',
					colName: 'info',
					complexSearch: {
						enable: true,
						type: 'string'
					},
					render: (value) => {
						return value ? `<span style="color: red;">${value}</span>` : '/';
					}
				}, {
					label: '请求方法',
					colName: 'method',
					complexSearch: {
						enable: true,
						type: 'string'
					},
					render: (value) => {
						return value ? value : '/';
					}
				}, {
					label: '请求路径',
					colName: 'cclass',
					complexSearch: {
						enable: true,
						type: 'string'
					},
					render: (value) => {
						return value ? value : '/';
					}
				}, {
					label: '操作',
					order: null,
					colName: null,
					width: 300,
					render: [
						{
							text: '编辑',
							type: 'button',
							cls: 'btn-xs btn-warning radius-button',
							event: () => {
								console.log('编辑');
							},
							exist: () => {
								return true;
							}
						}, {
							text: '删除',
							type: 'button',
							cls: 'btn-xs btn-danger radius-button',
							event: () => {
								console.log('删除');
							},
							exist: () => {
								return false;
							}
						}]
				}]
		}
	};

	constructor() {}

	// 表格初始完成
	ready() {
		console.log('table ready!');
	}

	// 行选择事件
	onRowSelect($event) {
		console.log($event);
	}

	// 刷新表格
	onTableRefresh() {
		console.log('table refresh!');
	}
}
