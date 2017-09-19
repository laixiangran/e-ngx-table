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
            serverUrl: `${environment.serverHost}TSewerageUserController/getSewerageUserListPage`,
            token: 'E4093EDF0EAD188D_117167E7B95C5682C836AFFD9845C6C97D95D44CEA66DC5705E63CD08F603A6500CF493097DD30FA'
        },
        operateBtn: [{
            text: '添加',
            cls: 'btn-success',
            event: () => {
                console.log(this);
            }
        }],
        columns: {
            primaryKey: 'id',
            batch: true,
            items: [{
                label: "工程名称",
                colName: "name",
                render: (value: any, obj: any) => {
                    return `<span style="color: royalblue;"><span class="glyphicon glyphicon-user"></span>value</span>`;
                },
                event: (data) => {
                    console.log(data);
                }
            }, {
                label: "工程编号",
                colName: "no",
                style: {color: 'red', 'font-weight': 'bold'}
            }, {
                label: "工程地址",
                colName: "address",
                ellipsis: true,
                width: '200px'
            }, {
                label: "创建时间",
                colName: "createtime",
                search: false
            }, {
                label: "操作",
                print: false,
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
                        text: '刪除',
                        cls: 'btn-danger btn-xs',
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
