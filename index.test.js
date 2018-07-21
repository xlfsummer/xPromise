let Promise = require("./index.js");

describe("base", ()=>{
  it("invoke fn in promise instantly", done => {
    let arr = [];
    new Promise((rs, rj) => {
      arr.push("promise");
    });
    arr.push("code");
  
    setTimeout(() => {
      expect(arr).toEqual(["promise", "code"]);
      done();
    }, 50);
  });
  
  it("invoke fn in then async", done => {
    let arr = [];
    new Promise((rs, rj) => {
      arr.push("promise");
      rs();
    }).then(() => {
      arr.push("then");
    });
    arr.push("sync");
  
    setTimeout(() => {
      expect(arr).toEqual(["promise", "sync", "then"]);
      done();
    }, 50);
  });
  
  it("resolve and then a value", done => {
    new Promise((rs, rj) => {
      rs(42);
    }).then(data => {
      expect(data).toBe(42);
      done();
    });
  });
  
  it("reject and catch a value", done => {
    new Promise((rs, rj) => {
      rj("Hello");
    }).catch(err => {
      expect(err).toBe("Hello");
      done();
    });
  });
  
  it("throw and catch a value", done => {
    new Promise((rs, rj) => {
      throw "world";
    }).catch(err => {
      expect(err).toBe("world");
      done();
    });
  });
  
  it("reject and catch a value define by 2nd arg in then", done => {
    new Promise((rs, rj) => {
      throw "Hello";
    }).then(
      _ => _,
      err => {
        expect(err).toBe("Hello");
        done();
      }
    );
  });
  
  it("throw and catch a value define by 2nd arg in then", done => {
    new Promise((rs, rj) => {
      throw "world";
    }).then(
      _ => _,
      err => {
        expect(err).toBe("world");
        done();
      }
    );
  });
  
  it("resolve a value async", done => {
    new Promise((rs, rj) => {
      setTimeout(() => rs(42));
    }).then(data => {
      expect(data).toBe(42);
      done();
    });
  });
});

describe("chain call", ()=>{
  it("chain call then - then", done => {
    new Promise(r => {
      setTimeout(()=>{
        r(3)
      });
    }).then(data => {
      return data * 2;
    }).then(data => {
      expect(data).toBe(6);
      done();
    });
  });
  
  it("chain call then - catch", done => {
    new Promise(r => {
      setTimeout(()=>{
        r(3)
      });
    }).then(data => {
      throw data * 2;
    }).catch(err => {
      expect(err).toBe(6);
      done();
    });
  });
  
  it("chain call catch - then", done => {
    new Promise((rs, rj) => {
      setTimeout(()=>{
        rj(3)
      });
    }).catch(err => {
      return err * 2;
    }).then(data => {
      expect(data).toBe(6);
      done();
    });
  });
  
  it("chain call catch - catch", done => {
    new Promise((rs, rj) => {
      setTimeout(()=>{
        rj(3)
      });
    }).catch(err => {
      throw err * 2;
    }).catch(err => {
      expect(err).toBe(6);
      done();
    });
  });

  it("jump through then when reject", done => {
    new Promise((rs, rj) => rj(3))
    .then(data => data + 10)
    .then(data => data * 2)
    .catch(err => {
      expect(err).toBe(3);
      done();
    });
  });

  it("jump through catch when resolve", done => {
    new Promise((rs, rj) => rs(3))
    .catch(data => data + 10)
    .catch(data => data * 2)
    .then(data => {
      expect(data).toBe(3);
      done();
    });
  });


});

describe("monaid", ()=>{
  it("allows resolve a Promise in promise", done=>{
    new Promise(r=>{
      setTimeout(()=>{
        r(new Promise(r=>{
          setTimeout(()=>{
            r(6);
          }, 10);
        }));
      },10);
    }).then(data=>{
      expect(data).toBe(6);
      done();
    });
  });

  it("allows resolve a Promise in promise in promise", done=>{
    /** resolve *value* after *time* */
    let delay = (time, value) => new Promise(r=> void setTimeout(_=>r(value), time));
    delay(10, delay(20, delay(30, 6)))
      .then(data=>{
        expect(data).toBe(6);
        done();
      });
  });

  it("allows return a Promise in then", done=>{
    new Promise(r=>{
      setTimeout(()=>r(3), 10);
    }).then(data=>{
      return new Promise((rs, rj)=>{
        setTimeout(()=>{ rs(data * 2) }, 10);
      });
    }).then(data => {
      expect(data).toBe(6);
      done();
    });
  });

  it("allows return a Promise in catch", done=>{
    new Promise((rs, rj)=>{
      setTimeout(()=>rj(3), 10);
    }).catch(data=>{
      return new Promise((rs, rj)=>{
        setTimeout(()=>{ rs(data * 2) }, 10);
      });
    }).then(data => {
      expect(data).toBe(6);
      done();
    });
  });
});