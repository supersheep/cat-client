# cat-client


## Install


```
$ npm install cat-client --save
```
请确保你的服务器配置了'/data/appdatas/cat/client.xml' ·


## Usage

```

var Cat = require("cat-client");

//应用初始化阶段
Cat.init({
  appName:"your-app-name"
});
//for koa middleware
app.use(Cat.middleware);


//in app

//log event
Cat.logEvent("URL","/index");

//log error
Cat.logError("error userId not found",error);

//transaction
var t = Cat.newTransaction("URL","/index");

//处理业务逻辑, 推荐使用generator同步写法，以确保其他调用setStatus complete 是在业务逻辑处理之后
//例如 yield biz();

t.setStatus(Cat.STATUS.SUCCESS);
t.complete();

```

## API

### Cat.logEvent(type , name , status, data)

新建event用以监控。


- `type` - {string} Event的type，默认值是undefined。

- `name` - {string} Event的name，默认值是undefined。

- `status` - {string} optional ,Event的status，请使用`Cat.STATUS`常量, 默认成功 

- `data` - {string} optional,   Event的data，默认值为undefined。

### Cat.logError(msg,error)

新建error用以监控。


- `msg` - {string} 用户需要记录的信息，默认值是undefined。

- `error` - {object} Error对象。

### Cat.newTransaction(type,name)

初始化生成一个transaction handler实例，包含一系列Transaction操作接口。



- `type` - {string} Transaction的type，默认值为undefined。

- `name` - {string} Transaction的name，默认值为undefined。

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


## NOTE

如果你使用了koa以及cat.middleware , 推荐使用 `this.cat` 获取cat实例， 以确保所有的打点都能汇总到单个请求中

this.cat和require('cat-client') 拿到的Cat实例 API一致


## Examples

- 抓取一个URL请求的数据

```javascript
//in koa middleware

var t = Cat.newTranscation('URL',this.path);

t.addData(this.url);

t.logEvent('URL','URL.Server',Ca.SUCCESS, 'Refer='+this.header.referer+';Agent='+this.header['user-agent']);

yield next;

t.setStatus(this.status < 400 ? Cat.FAIL : Cat.SUCCESS);
t.complete();

```
在Cat的Transaction页面就能看到按URL打的所有URL信息


