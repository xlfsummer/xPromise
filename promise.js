new Promise(r=>{
    setTimeout(()=>{
      r(new Promise(r=>{
        setTimeout(()=>{
          r(6);
        }, 10);
      }));
    },10);
  }).then(data=>{
    console.log(data);
  });