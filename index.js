let xPromise = class xPromise {
  constructor(excecutor) {
    this._promiseValue = void 0;
    this._promiseStatus = "pending";

    this._resolveQueue = [];
    this._rejectQueue = [];

    let resolve = data => {
      if (data && typeof data.then == "function")
        return void data.then(resolve, reject); //data 是一个 thenable (PromiseLike)

      if (this._promiseStatus != "pending") return;
      this._promiseStatus = "fulfilled";
      this._promiseValue = data;
      void setTimeout(_ => this._resolveQueue.forEach(cb => cb(data)));
    };

    let reject = reason => {
      if (this._promiseStatus != "pending") return;
      this._promiseStatus = "rejected";
      this._promiseValue = reason;
      void setTimeout(_ => {
        if (!this._rejectQueue.length && !this._caught)
          console.error("uncaught (in promise)", reason);
        this._rejectQueue.forEach(cb => cb(reason));
      });
    };

    try {
      excecutor(resolve, reject);
    } catch (err) {
      reject(err);
    }

    return this;
  }

  then(onfulfilled, onrejected) {
    let tryFn = (fn, resolve, reject) => {
      return value => {
        try {
          resolve(fn(value));
        } catch (e) {
          reject(e);
        }
      };
    };

    return new xPromise((nextResolve, nextReject) => {
      let fulfilledFn = onfulfilled
        ? tryFn(onfulfilled, nextResolve, nextReject)
        : nextResolve;

      let rejectedFn = onrejected
        ? tryFn(onrejected, nextResolve, nextReject)
        : nextReject;

      void {
        pending: _ => {
          this._resolveQueue.push(fulfilledFn);
          this._rejectQueue.push(rejectedFn);
        },
        fulfilled: _ => {
          setTimeout(_ => fulfilledFn(this._promiseValue));
        },
        rejected: _ => {
          this._caught = true;
          setTimeout(_ => rejectedFn(this._promiseValue));
        }
      }[this._promiseStatus]();
    });
  }

  catch(catchFn) {
    return this.then(void 0, catchFn);
  }

  static resolve(data) {
    return new xPromise(r => r(data));
  }

  static reject(reason) {
    return new xPromise((_, r) => r(reason));
  }
};

module.exports = xPromise;
