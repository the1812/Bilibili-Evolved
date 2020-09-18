# 代码贡献指南 Pull Request Guide

## 环境需求
- [.NET Core 3.1+](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/en/download/)
  - [全局安装 yarn](https://yarnpkg.com/getting-started/install#global-install)

## 下载项目代码
将项目 Fork 至自己账户

然后克隆至本地
```powershell
git clone --single-branch -b preview https://github.com/{{your-name}}/Bilibili-Evolved.git
cd Bilibili-Evolved
```

## 安装依赖
```powershell
yarn
```
如果太慢的话请换用淘宝镜像
```powershell
yarn --registry=https://registry.npm.taobao.org/
```

## 修改代码
待补充:
- 修改现有功能
- 添加新功能

## 构建/监视
编译代码 (有时候要跑两次才能真正编译完成, 玄学bug)

(VSCode 对应任务: `重新编译 rebuild`)
```powershell
dotnet builder/dotnet/publish/build.dll
```

监视代码改动 (Vue构建偶尔会出bug假死, 关掉重启下就行)

(VSCode 对应任务: `监视 watch`)
```powershell
dotnet builder/dotnet/publish/build.dll watch
```

## 提交 commit
- 调试过程中会产生编译后的文件(`min`文件夹里的东西和根目录的4个脚本主文件), 建议提交前放弃这些文件的更改, 只提交对源代码的修改, 防止冲突
- commit message 只需写明改动点, 中英文随意, 也不强求类似 [commit-lint](https://github.com/conventional-changelog/commitlint) 的格式

## 发起合并请求
将 preview 分支往主仓库的 preview 分支合并就行
