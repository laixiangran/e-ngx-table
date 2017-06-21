import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    option: any = {
        serverUrl: 'http://192.168.0.88/drainage/TSewerageUserController/getSewerageUserListPage',
        columns: {
            primaryKey: "id",
            items: [{
                label: "工程名称",
                colName: "name"
            }, {
                label: "工程编号",
                colName: "no",
                style: {color: 'red', 'font-weight': 'bold'},
            }, {
                label: "工程地址",
                colName: "address"
            }, {
                label: "创建时间",
                colName: "createtime"
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

}
