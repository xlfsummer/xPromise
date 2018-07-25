let Promise = require("./index.js");

describe("base", () => {
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

  it("then and catch can be called with nothing", done => {
    new Promise(r => r(42))
      .then()
      .catch()
      .then(d => {
        expect(d).toBe(42);
        done();
      });
  });
});

describe("chain call", () => {
  it("chain call then - then", done => {
    new Promise(r => {
      setTimeout(() => {
        r(3);
      });
    })
      .then(data => {
        return data * 2;
      })
      .then(data => {
        expect(data).toBe(6);
        done();
      });
  });

  it("chain call then - catch", done => {
    new Promise(r => {
      setTimeout(() => {
        r(3);
      });
    })
      .then(data => {
        throw data * 2;
      })
      .catch(err => {
        expect(err).toBe(6);
        done();
      });
  });

  it("chain call catch - then", done => {
    new Promise((rs, rj) => {
      setTimeout(() => {
        rj(3);
      });
    })
      .catch(err => {
        return err * 2;
      })
      .then(data => {
        expect(data).toBe(6);
        done();
      });
  });

  it("chain call catch - catch", done => {
    new Promise((rs, rj) => {
      setTimeout(() => {
        rj(3);
      });
    })
      .catch(err => {
        throw err * 2;
      })
      .catch(err => {
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

describe("monaid", () => {
  it("allows resolve a Promise in promise", done => {
    new Promise(r => {
      setTimeout(() => {
        r(
          new Promise(r => {
            setTimeout(() => {
              r(6);
            }, 10);
          })
        );
      }, 10);
    }).then(data => {
      expect(data).toBe(6);
      done();
    });
  });

  it("allows resolve a Promise in promise in promise", done => {
    /** resolve *value* after *time* */
    let delay = (time, value) =>
      new Promise(r => void setTimeout(_ => r(value), time));
    delay(10, delay(20, delay(30, 6))).then(data => {
      expect(data).toBe(6);
      done();
    });
  });

  it("allows return a Promise in then", done => {
    new Promise(r => {
      setTimeout(() => r(3), 10);
    })
      .then(data => {
        return new Promise((rs, rj) => {
          setTimeout(() => {
            rs(data * 2);
          }, 10);
        });
      })
      .then(data => {
        expect(data).toBe(6);
        done();
      });
  });

  it("allows return a Promise in catch", done => {
    new Promise((rs, rj) => {
      setTimeout(() => rj(3), 10);
    })
      .catch(data => {
        return new Promise((rs, rj) => {
          setTimeout(() => {
            rs(data * 2);
          }, 10);
        });
      })
      .then(data => {
        expect(data).toBe(6);
        done();
      });
  });

  it("rejected, when resolve a rejected Promise", done => {
    new Promise((rs, rj) => {
      rs(new Promise((rs, rj) => rj(1)));
    }).catch(e => {
      expect(e).toBe(1);
      done();
    });
  });

  it("rejected, when reject a resolved Promise", done => {
    new Promise((rs, rj) => {
      rj(new Promise(r => r(1)));
    }).catch(e => {
      expect(e).toBeInstanceOf(Promise);
      done();
    });
  });

  it("rejected, when throw a resolved Promise", done => {
    new Promise((rs, rj) => {
      throw new Promise(r => r(1));
    }).catch(e => {
      expect(e).toBeInstanceOf(Promise);
      done();
    });
  });
});

describe("other", () => {
  it("link multi then/catch to one Promise", done => {
    let p = new Promise(resolve => setTimeout(() => resolve(42)));
    p.then(_ => 1)
      .then(_ => {
        throw 3;
      })
      .catch(_ => _);
    p.catch(err => 4).then(_ => 5);
    p.then(_ => _ + 1).then(data => {
      expect(data).toBe(43);
      done();
    });
    p.then(data => {});
  });

  it("run async when add onfulfilled cb to an already fulfilled promise", done => {
    let p = new Promise(r => r(1));
    setTimeout(() => {
      let a = 0;
      p.then(d => (a = d));
      expect(a).toBe(0);
      setTimeout(() => {
        expect(a).toBe(1);
        done();
      }, 10);
    }, 10);
  });

  it("can resolve only once", done => {
    let r,
      p = new Promise(re => (r = re));
    r(1);
    r(2);
    p.then(data => {
      expect(data).toBe(1);
      done();
    });
  });

  it("oneway state change", done => {
    let rs,
      rj,
      p = new Promise((resolve, reject) => {
        rs = resolve;
        rj = reject;
      });

    rs(1);
    rj(2);

    p.then(data => {
      expect(data).toBe(1);
      done();
    });
  });

  it("support async/await", done => {
    (async () => {
      let r = await new Promise(r => r(3)).then(d => d ** 2);
      expect(r).toBe(9);
      done();
    })();
  });
});

describe("static - resolve reject", () => {
  it("resolve", done => {
    Promise.resolve(4).then(d => {
      expect(d).toBe(4);
      done();
    });
  });

  it("reject", done => {
    Promise.reject(4).catch(d => {
      expect(d).toBe(4);
      done();
    });
  });

  it("resolve resolve", done => {
    Promise.resolve(Promise.resolve(4)).then(d => {
      expect(d).toBe(4);
      done();
    });
  });

  it("resolve reject", done => {
    Promise.resolve(Promise.reject(4)).catch(d => {
      expect(d).toBe(4);
      done();
    });
  });

  it("support async/await", done => {
    (async () => {
      let r = await Promise.resolve(3);
      expect(r).toBe(3);
      done();
    })();
  });

  it("support async/await try/catch", done => {
    (async () => {
      try {
        await Promise.reject(3);
      } catch (e) {
        expect(e).toBe(3);
        done();
      }
    })();
  });
});
