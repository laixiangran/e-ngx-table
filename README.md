# essence-ng2-table

essence-ng2-table is a Table component for Angular.

## Introduce

1. 必须与后台配合，根据配置项自动获取数据

2. 支持分页

3. 支持批量选择行

4. 支持列排序及条件筛选

## Usage

1. Install

	```shell
	npm install --save essence-ng2-table@latest
	```

2. Set in the .angular-cli.json（@angular/cli）

    ```json
    "styles": [
        "../node_modules/bootstrap/dist/css/bootstrap.min.css",
        "../node_modules/font-awesome/css/font-awesome.min.css"
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
    <essence-ng2-table [option]="option" (ready)="ready()"></essence-ng2-table>
    ```

5. Use in Component

    ```typescript
    option: any = {
        serverUrl: 'http://192.168.0.88/zhijian/auth/project/selectByEssenceTablePage.do',
        columns: {
            primaryKey: "c_id",
            items: [{
                label: "工程名称",
                colName: "c_name"
            }]
        }
    };

    ready() {
        console.log('essence table ready.');
    }
    ```

## API

### Inputs

- `option` (`?Object`) - 表格配置项

### Outputs (event)

- `ready` - 表格准备就绪后会触发该事件

### Instance Method

- `refresh(): void` - 刷新列表数据

- `getSelectedItems(): any[]` - 获取批量选中的条目

## Develop

	```shell
	npm install // 安装依赖包

	npm start // 启动项目
	```

# License

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](/LICENSE)
