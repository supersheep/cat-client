var Cat = require("../index");

var pt = Cat.newTransaction("ParentT"+Math.random(), "P");

var ct = Cat.newTransaction("ChildT", "C");

Cat.logEvent("SomeEvent", "e");

ct.setStatus(Cat.STATUS.SUCCESS);
ct.complete();


pt.setStatus(Cat.STATUS.SUCCESS);

pt.complete();


 pt = Cat.newTransaction("ParentT"+Math.random(), "P");

ct = Cat.newTransaction("ChildT", "C");

Cat.logEvent("SomeEvent", "e");

ct.setStatus(Cat.STATUS.SUCCESS);
ct.complete();


pt.setStatus(Cat.STATUS.SUCCESS);

pt.complete();