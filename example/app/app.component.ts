import { Component, ViewChild } from '@angular/core';
import { ENgxTableComponent } from '../../src/e-ngx-table.component';
import { environment } from '../environments/environment';
import {Sys} from './utils/sys';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	@ViewChild(ENgxTableComponent) table: ENgxTableComponent;
	data = [{
		text: '编辑中',
		value: 2
	}, {
		text: '已通过',
		value: 1
	}, {
		text: '未通过',
		value: 0
	}, {
		text: '待审核',
		value: 3 || null
	}];
	option: any = {
		serverParam: {
			serverUrl: `${environment.serverHost}SysLogController/getSysLogListPage`,
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
			items: [/*{
				label: '操作人',
				colName: 'user',
				search: false,
				render: (value: any) => {
					if (value) {
						return value.realName;
					} else {
						return '/';
					}
				}
			}, */{
				label: '操作时间',
				colName: 'date',
				search: true,
				complexSearch: {
					enable: true,
					type: 'string'
				},
				render: (value) => {
					return value ? Sys.dateFormat(value, 'yyyy-MM-dd') : '/';
				}
			}, {
				label: '描述信息',
				colName: 'info',
				search: false,
				complexSearch: {
					enable: true,
					type: 'string'
				},
				render: (value) => {
					return value ? value : '/';
				}
			}, {
				label: '请求方法',
				colName: 'method',
				search: true,
				complexSearch: {
					enable: true,
					type: 'select',
					data: this.data
				},
				render: (value) => {
					return value ? value : '/';
				}
			}, {
				label: '请求路径',
				colName: 'cclass',
				search: false,
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
				render: [{
					text: '微信通知',
					type: 'button',
					cls: 'btn-xs btn-info radius-button',
					exist: () => {
						return false;
					}
				}, {
					text: '附件',
					type: 'button',
					cls: 'btn-xs btn-success radius-button',
					exist: () => {
						return true;
					}
				}, {
					text: '编辑',
					type: 'button',
					cls: 'btn-xs btn-warning radius-button',
					exist: () => {
						return false;
					}
				}, {
					text: '删除',
					type: 'button',
					cls: 'btn-xs btn-danger radius-button',
					exist: () => {
						return true;
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
