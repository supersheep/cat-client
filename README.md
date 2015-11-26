# cat-client


## Install

确保你的npm使用了内网仓库
 
```

npm config set registry http://r.npmjs.dp/

```

```
$ npm install @dp/cat-client --save
```

## Usage

```
var Cat = require('@dp/cat-client');

//node-server 默认已经完成此初始化
Cat.init({
    appName:"node-xxx-web"
});

//log event
Cat.logEvent({
    type:"URL",
    name:"/index"
});

//log error
Cat.logError({
    msg:"error userId not found",
    cause:e
});

//transaction
var t = Cat.newTransaction({
    type:"URL",
    name:"/index"
});
//处理业务逻辑, 推荐使用generator同步写法，以确保其他调用setStatus complete 是在业务逻辑处理之后
//例如 yield biz();

t.setStatus(Cat.STATUS.SUCCESS);
t.complete();

```

## API

### Cat.logEvent(options)

新建event用以监控。

- `options`: {object}

    options包含一下内容：

    `type` - {string} Event的type，默认值是undefined。

    `name` - {string} Event的name，默认值是undefined。

    `status` - {string} Event的status，请使用`Cat.STATUS`常量, 默认成功

    `data` - {string} Event的data，默认值为undefined。

### Cat.logError(options)

新建error用以监控。

- `options`: {object}

    options包含一下内容：

    `msg` - {string} 用户需要记录的信息，默认值是undefined。

    `cause` - {object}	Error对象。

### Cat.newTransaction(options)

初始化生成一个transaction handler实例，包含一系列Transaction操作接口。

- `options`: {object}

    options包含以下的内容：

    `type` - {string} Transaction的type，默认值为undefined。

    `name` - {string} Transaction的name，默认值为undefined。

#### transactionHandler.setStatus(status)

设置transaction的状态，0表示成功，非零表示失败，默认值是0。

`status`: {string} , 参见 `Cat.STATUS`常量

#### transactionHandler.addData(data)

添加transaction的数据，默认值为undefined。

`data`: {string}

#### transactionHandler.complete()

完成transaction。

### Cat.STATUS

`logEvent` ,`transaction.setStatus` 所使用的状态码
- `SUCCESS` 成功
- `FAIL`    失败
