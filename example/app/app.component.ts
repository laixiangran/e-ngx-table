import { Component, ViewChild } from '@angular/core';
import { EssenceNg2TableComponent } from "../../src/essence-ng2-table.component";
import { environment } from "../environments/environment";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    @ViewChild(EssenceNg2TableComponent) table: EssenceNg2TableComponent;

    option: any = {
        serverParam: {
            serverUrl: `${environment.serverHost}TSewerageUserController/getSewerageUserListPage`
        },
        columns: {
            primaryKey: 'id',
            batch: true,
            items: [{
                label: "工程名称",
                colName: "name",
                render: (value: any, obj: any) => {
                    return `<span style="color: royalblue;"><span class="glyphicon glyphicon-user"></span>value</span>`;
                }
            }, {
                label: "工程编号",
                colName: "no",
                style: {color: 'red', 'font-weight': 'bold'}
            }, {
                label: "工程地址",
                colName: "address",
                filterProp: {
                    type: 'select',
                    value: [
                        {
                            text: '8888',
                            value: '888'
                        },
                        {
                            text: '北京市',
                            value: '北京市'
                        }
                    ]
                }
            }, {
                label: "创建时间",
                colName: "createtime",
                search: false,
                filterProp: {
                    type: 'date',
                    operator: 'lt'
                }
            }, {
                label: "操作",
                print: false,
                filterProp: {
                    enabled: false
                },
                order: null,
                render: [
                    {
                        text: '编辑',
                        cls: 'btn-info btn-xs',
                        event: (obj: any) => {
                            console.log(obj);
                        }
                    },
                    {
                        text: '编辑',
                        cls: 'btn-info btn-xs',
                        event: (obj: any) => {
                            console.log(obj);
                        }
                    }
                ]
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
    refresh() {
        this.table.refresh();
    }

}
