import { Component, ViewChild } from '@angular/core';
import { EssenceNg2TableComponent } from "../../src/essence-ng2-table.component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    @ViewChild(EssenceNg2TableComponent) table: EssenceNg2TableComponent;

    option: any = {
        serverUrl: 'http://192.168.0.88/zhijian/auth/project/selectByEssenceTablePage.do',
        columns: {
            primaryKey: "c_id",
            items: [{
                label: "工程名称",
                colName: "c_name"
            }, {
                label: "工程编号",
                colName: "c_no",
                style: {color: 'red', 'font-weight': 'bold'},
            }, {
                label: "工程量",
                colName: "c_build_content"
            }, {
                label: "工程地址",
                colName: "c_addr"
            }, {
                label: "工程规模",
                colName: "c_scale"
            }, {
                label: "注册状态",
                colName: "n_register_check_status",
                width: 100,
                filterProp: {
                    enabled: true,
                    type: "select",// string,select,date,datetime,num,combobox
                    value: [{
                        text: '待审核',
                        value: 2
                    }, {
                        text: '已通过',
                        value: 1
                    }, {
                        text: '未通过',
                        value: 0
                    }],
                    compare: "=" // like,=,>,<,between
                }
            }, {
                label: "划分状态",
                colName: "n_divide_check_status",
                width: 100,
                filterProp: {
                    enabled: true,
                    type: "select",// string,select,date,datetime,num,combobox
                    value: [{
                        text: '待划分',
                        value: 0
                    }, {
                        text: '待请示',
                        value: 1
                    }, {
                        text: '待批复',
                        value: 4
                    }, {
                        text: '已批复',
                        value: 5
                    }],
                    compare: "=" // like,=,>,<,between
                }
            }, {
                label: "创建时间",
                colName: "d_createtime"
            }, {
                label: "操作",
                filterProp: {
                    enabled: false
                },
                render: [
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

    ready() {
        console.log('table ready!');
    }

    // 刷新表格
    refresh() {
        this.table.refresh();
    }
}
