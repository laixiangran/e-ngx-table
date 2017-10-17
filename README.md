# essence-ng2-table

essence-ng2-table is a Table component for Angular.

## Introduce

1. 必须与后台配合，根据配置项自动获取数据

2. 支持分页

3. 支持单元格自定义格式及点击操作

4. 支持高级搜索

5. 支持批量选择行数据

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
    <essence-ng2-table [option]="option" (ready)="ready($event)" (rowSelect)="onRowSelect($event)"></essence-ng2-table>
    ```

5. Use in Component

    ```typescript
    table: EssenceNg2TableComponent;

    option: any = {
        serverParam: {
            serverUrl: 'http://192.168.0.88/drainage/TSewerageUserController/getSewerageUserListPage',
            token: '' // 传入登录之后得到的令牌
        },
        operateBtn: [{
                 text: '添加',
                 cls: 'btn-success',
                 event: () => {
                     console.log('添加操作！');
                 }
             }],
        columns: {
            primaryKey: 'id', // （一般要配置，如果错了rowSelect事件会失效）
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
                width: 200
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

    // 表格初始完成
    ready($event) {
        this.table = $event;
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
    token: "", // 令牌
    currentPage: 1, // 当前页
    pageSize: 10, // 每页显示页数
    conditions: [{fieldName: '', value: '', operator: 'LIKE'}], // 查询条件
    orders: [{fieldName: '', value: '', operator: 'DESC'}], // 排序条件
    search: "", // 全局搜索值
    fileds: [] // 全局搜索对应字段
},
operateBtn [] ： 按钮对象数组，对象属性{text: 按钮文本, cls：按钮样式类, event：按钮点击事件
columns: {
    primaryKey: "id", // 主键
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
        width: null, // 单元格宽度，如'100px'
        cls: "text-center", // 单元格样式类
        style: null, // 单元格样式
        ellipsis: false, // 文字超出单元格是否显示...
        // 单元格格式化，如果是函数，函数参数(value：当前单元格值, obj：单元格所在行数据对象)，单元格显示函数返回的值。
        // 如果是对象数组，就显示按钮，对象属性{text: 按钮文本, cls：按钮样式类, event：按钮点击事件}
        render: null, //  单元格格式化，如果是函数(value: any, obj: any) => {}，就显示函数返回的值，如果是数组，就显示按钮{text, cls, event}
        event: null, // 单元格点击事件, 返回当前行的数据对象
    }
}
```

```json
operator的值可以有:
"EQ"; // 相等
"NE"; // 不相等
"LIKE"; // 包含
"GT"; // 大于
"LT"; // 小于
"GTE"; // 大于等于
"LTE"; // 小于等于
"AND"; // 交集，复杂条件使用
"OR"; // 并集，复杂条件使用
"IN"; // IN
"ASC"; // 正序，排序使用
"DESC"; // 倒序，排序使用
```

### Outputs (event)

- `ready` - 表格准备就绪后会触发该事件，参数$event为EssenceNg2TableComponent的实例

- `rowSelect` - 行选择事件，参数$event表示已选行的数据，数据类型为对象数组

- `tableRefresh` - 表格刷新后会触发该事件，参数$event为EssenceNg2TableComponent的实例

### Instance Method

- `refresh(): void` - 刷新列表数据

## Develop

	```shell
	npm install // 安装依赖包

	npm start // 启动项目
	```

# License

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](/LICENSE)
