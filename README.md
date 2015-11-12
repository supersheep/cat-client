# cat-client


## Install


```
$ npm install @dp/cat-client --save
```

## 配置

部署应用的服务器上对应路径添加配置文件：/data/appdatas/cat/client.json

格式如下：

```
{
    "server": {
        "ip": "xxx.xxx.xxx.xxx",
        "port": xxxx
    },
    "domain": "hahaha"
}
```

## Usage

```
var Cat = require('@dp/cat-client');
```

## API

### Transaction

#### Cat.newTransaction(options)

初始化生成一个transaction handler实例，包含一系列Transaction操作接口。

`options`: {object}

options包含以下的内容：

`type` - {string} Transaction的type，默认值为undefined。

`name` - {string} Transaction的name，默认值为undefined。

#### transactionHandler.setStatus(status)

设置transaction的状态，0表示成功，非零表示失败，默认值是0。

`status`: {string}

#### transactionHandler.addData(data)

添加transaction的数据，默认值为undefined。

`data`: {string}

#### transactionHandler.complete()

完成transaction。

### Event

#### Cat.logEvent(options)

新建event用以监控。

`options`: {object}

options包含一下内容：

`type` - {string} Event的type，默认值是undefined。

`name` - {string} Event的name，默认值是undefined。

`status` - {string} Event的status，0表示成功，非零表示失败，默认值是0。

`data` - {string} Event的data，默认值为undefined。

#### Cat.logError(options)

新建error用以监控。

`options`: {object}

options包含一下内容：

`msg` - {string} 用户需要记录的信息，默认值是undefined。

`cause` - {object}	Error对象。