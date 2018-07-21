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

    let onResolve = _ => _;
    let onReject = err => {
      err.message = "uncaught reject: " + err.message;
      throw new Error(err);
    };

    this.then = function(thenFn, catchFn) {
      return new xPromise(function(nextResolve, nextReject) {
        if(thenFn)
          onResolve = function(data) {
            let ret = tryFn(thenFn.bind(void 0, data), nextReject);
            nextResolve(ret);
          };
        else
          onResolve = nextResolve;

        if (catchFn)
          onReject = function(err) {
            let ret = tryFn(catchFn.bind(void 0, err), nextReject);
            nextResolve(ret);
          };
        else
          onReject = nextReject;
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