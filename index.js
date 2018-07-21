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

    this.then = function(fn1, fn2) {
      return new xPromise(function(resolve, reject) {
        onResolve = function(data) {
          let ret;
          try {
            ret = fn1(data);
          } catch (e) {
            reject(e);
          }
          resolve(ret);
        };

        onReject = function(err) {
          let ret;
          if (fn2 === undefined) {
            reject(err);
          } else {
            try {
              ret = fn2(err);
            } catch (e) {
              reject(e);
            }
            resolve(ret);
          }
        };
      });
    };

    this.catch = function(fn) {
      return new xPromise(function(resolve, reject) {
        onResolve = function(data) {
          resolve(data);
        };

        onReject = function(err) {
          let ret;
          try {
            ret = fn(err);
          } catch (e) {
            reject(e);
          }
          resolve(ret);
        };
      });
    };

    try {
      fn(resolve, reject);
    } catch (e) {
      reject(e);
    }

    return this;
  }
};

module.exports = xPromise;
