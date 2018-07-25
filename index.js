let xPromise = class xPromise {
  constructor(excecutor) {

    this._resolveValue = null;
    this._state = "pending";

    this._resolveQueue = [];
    this._rejectQueue = [];

    let resolve = data =>
      void setTimeout(_ => {
        this._state = "fulfilled";
        this._resolveValue = data;
        data && typeof data.then == "function"
          ? data.then(resolve, reject) //data 是一个 thenable (PromiseLike)
          : this._resolveQueue.forEach(cb => cb(data));
      });

    let reject = reason =>
      void setTimeout(_ => {
        this._state = "rejected";
        this._resolveValue = reason;
        this._rejectQueue.forEach(cb => cb(reason));
        !this._rejectQueue.length && console.error("uncaught (in promise)", reason);
      });

    try { excecutor(resolve, reject) }
    catch (err) { reject(err) }

    return this;
  }

  then(onfulfilled, onrejected) {
    let tryFn = (fn, resolve, reject) => {
      return value => {
        try { resolve(fn(value)) }
        catch (e) { reject(e) }
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
          setTimeout(_ => fulfilledFn(this._resolveValue));
        },
        rejected: _ => {
          setTimeout(_ => rejectedFn(this._resolveValue));
        }
      }[this._state]();
    });
  }

  catch(catchFn) {
    return this.then(void 0, catchFn);
  }
};

module.exports = xPromise;
