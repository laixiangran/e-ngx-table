import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    option: any = {
        serverUrl: 'http://192.168.0.88/zhijian/auth/project/selectByEssenceTablePage.do',
        columns: {
            items: [{
                label: "系统编号",
                colName: "c_id",
                visible: false,
                order: false,
                width: null,
                cls: "text-center",
                style: null,
                ellipsis: false,
                filterProp: {
                    enabled: true,
                    type: "string",// string,select,date,datetime,num,combobox
                    compare: "like" // like,=,>,<,between
                },
                render: (obj) => {
                }
            }, {
                colName: "n_register_check_status",
                cls: "text-center",
                visible: false,
                filterProp: {
                    enabled: true,
                    type: "string",
                    compare: '=',
                    value:1
                }
            }, {
                label: "工程名称",
                colName: "c_name",
                visible: true,
                order: true,
                width: null,
                cls: "text-center",
                style: null,
                ellipsis: false,
                filterProp: {
                    enabled: true,
                    type: "string",// string,select,date,datetime,num,combobox
                    compare: "like" // like,=,>,<,between
                },
                render: (obj) => {
                }
            }, {
                label: "工程编号",
                colName: "c_no",
                visible: true,
                order: true,
                width: null,
                cls: "text-center",
                style: null,
                ellipsis: false,
                filterProp: {
                    enabled: true,
                    type: "string",// string,select,date,datetime,num,combobox
                    compare: "like" // like,=,>,<,between
                },
                render: (obj) => {
                }
            }, {
                label: "工程量",
                colName: "c_build_content",
                visible: true,
                order: true,
                width: null,
                cls: "text-center",
                style: null,
                ellipsis: false,
                filterProp: {
                    enabled: true,
                    type: "string",// string,select,date,datetime,num,combobox
                    compare: "like" // like,=,>,<,between
                },
                render: (obj) => {
                }
            }, {
                label: "工程地址",
                colName: "c_addr",
                visible: true,
                order: true,
                width: null,
                cls: "text-center",
                style: null,
                ellipsis: false,
                filterProp: {
                    enabled: true,
                    type: "string",// string,select,date,datetime,num,combobox
                    compare: "like" // like,=,>,<,between
                },
                render: (obj) => {
                }
            }, {
                label: "工程规模",
                colName: "c_scale",
                visible: true,
                order: true,
                width: null,
                cls: "text-center",
                style: null,
                ellipsis: false,
                filterProp: {
                    enabled: true,
                    type: "string",// string,select,date,datetime,num,combobox
                    compare: "like" // like,=,>,<,between
                },
                render: (obj) => {
                }
            }, {
                label: "注册状态",
                colName: "n_register_check_status",
                visible: true,
                order: true,
                width: null,
                cls: "text-center",
                style: null,
                ellipsis: false,
                filterProp: {
                    enabled: true,
                    type: "select",// string,select,date,datetime,num,combobox
                    data : [{
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
                },
                render: (obj) => {
                }
            }, {
                label: "划分状态",
                colName: "n_divide_check_status",
                visible: true,
                order: true,
                width: null,
                cls: "text-center",
                style: null,
                ellipsis: false,
                filterProp: {
                    enabled: true,
                    type: "select",// string,select,date,datetime,num,combobox
                    data : [{
                        text: '待划分',
                        value: 0
                    },{
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
                },
                render: (obj) => {
                }
            },  {
                label: "创建时间",
                colName: "d_createtime",
                visible: true,
                order: true,
                width: 200,
                cls: "text-center",
                style: null,
                ellipsis: false,
                filterProp: {
                    enabled: true,
                    type: "date",// string,select,date,datetime,num,combobox
                    compare: "like" // like,=,>,<,between
                },
                render: (obj) => {
                }
            }]
        }
    };

    constructor() {}

    ready() {}

}
