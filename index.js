let xPromise = class xPromise {
  /** @param {(resolve: Function, reject: Function) =>any} fn*/
  constructor(fn) {
    let resolve = data => void setTimeout( _ =>
          data instanceof xPromise
            ? data.then(resolve, reject)
            : onResolve(data)
      );

    let reject = err => void setTimeout( _ =>
          err instanceof xPromise
            ? err.then(resolve, reject)
            : onReject(err)
      );

    let onResolve = data =>{
      for(let cb of resolveQueue) cb(data);
    };

    let onReject = err => {
      for(let cb of rejectQueue) cb(err);
      if(!rejectQueue.length){
        err.message = "uncaught reject: " + err.message
        throw new Error(err)
      }
    };

    let resolveQueue = [];
    let rejectQueue = [];

    this.then = function(thenFn, catchFn) {
      return new xPromise(function(nextResolve, nextReject) {
        if(thenFn)
          resolveQueue.push(data => {
            let ret = tryFn(thenFn.bind(void 0, data), nextReject);
            nextResolve(ret);
          });
        else
          resolveQueue.push(nextResolve);

        if (catchFn)
          rejectQueue.push(err => {
            let ret = tryFn(catchFn.bind(void 0, err), nextReject);
            nextResolve(ret);
          });
        else
          rejectQueue.push(nextReject);
      });
    };

    this.catch = this.then.bind(this, void 0);

    tryFn(fn.bind(void 0, resolve, reject), reject);

    function tryFn(fn, onErr){
      let ret;
      try{ ret = fn() }
      catch(e){ onErr(e) }
      return ret;
    }

    return this;
  }
};

module.exports = xPromise;
