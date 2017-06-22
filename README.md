# essence-ng2-table

essence-ng2-table is a Table component for Angular.

## Introduce

1. 必须与后台配合，根据配置项自动获取数据

2. 支持分页

4. 支持列排序及条件筛选

5. 支持单元格自定义格式

6. 支持高级搜索

7. 支持批量选择行数据

## Usage

1. Install

	```shell
	npm install --save essence-ng2-table@latest
	```

2. Set in the .angular-cli.json（@angular/cli）

    ```json
    "styles": [
        "../node_modules/bootstrap/dist/css/bootstrap.min.css",
        "../node_modules/font-awesome/css/font-awesome.min.css",
        "../node_modules/essence-ng2-datetimepicker/dist/assets/css/bootstrap-datetimepicker.min.css"
    ],
    "scripts": [
        "../node_modules/jquery/dist/jquery.min.js",
        "../node_modules/moment/min/moment.min.js",
        "../node_modules/moment/min/moment-with-locales.min.js",
        "../node_modules/essence-ng2-datetimepicker/dist/assets/js/bootstrap-datetimepicker.min.js",
        "../node_modules/bootstrap/dist/js/bootstrap.min.js"
    ]
    ```

3. Add the EssenceNg2TableModule

	```typescript
	import {EssenceNg2TableModule} from "essence-ng2-table";
	@NgModule({
	    imports: [
	        EssenceNg2TableModule
	    ]
	})
	```


4. Use in Template

    ```html
    <essence-ng2-table [option]="option" (ready)="ready()" (rowSelect)="onRowSelect($event)"></essence-ng2-table>
    ```

5. Use in Component

    ```typescript
    @ViewChild(EssenceNg2TableComponent) table: EssenceNg2TableComponent;

    option: any = {
        serverParam: {
            serverUrl: 'http://192.168.0.88/drainage/TSewerageUserController/getSewerageUserListPage'
        },
        columns: {
            primaryKey: 'id', // （一般要配置，如果错了rowSelect事件会失效）
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
                    operator: 'eq'
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
                    }
                ]
            }]
        }
    };

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
    ```

## API

### Inputs

- `option` (`Object`) - 表格配置项，默认配置如下：

```json
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
    index: { // 序号列
        enabled: true, // 是否启用
        print: true // 是否可以打印
    },
    items: {
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
           enabled: true, // 是否启用
           type: "string", // 字段数据类型，可取值：string, date, select
           operator: "like", // 操作符号，可取值：like, eq
           value: null // 筛选的值
        },
        // 单元格格式化，如果是函数，函数参数(value：当前单元格值, obj：单元格所在行数据对象)，单元格显示函数返回的值。
        // 如果是对象数组，就显示按钮，对象属性{text: 按钮文本, cls：按钮样式类, event：按钮点击事件}
        render: null
    }
}
```

### Outputs (event)

- `ready` - 表格准备就绪后会触发该事件

- `rowSelect` - 行选择事件，参数$event表示已选行的数据，数据类型为对象数组

### Instance Method

- `refresh(): void` - 刷新列表数据

## Develop

	```shell
	npm install // 安装依赖包

	npm start // 启动项目
	```

# License

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](/LICENSE)
