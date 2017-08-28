组件代码生成工具使用说明。
基于命令行运行，可以生成组件的基础框架代码。
运行命令如下：
node codecreator.js -n NewComp01 -d yes
-n 指定组件名称
-d yes 将生成代码部署到代码目录(src)中，并且更新pages中的menu和routing模块。

组件名称及其生产文件对于关系
组件名：NewComp01
组件目录名(组件名转小写)：newcomp01
文件名：
newcomp01.component.html
newcomp01.component.ts
newcomp01.module.ts
newcomp01.routing.ts
