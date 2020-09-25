
class Promise {
    constructor(exeutor) {
        //状态初始化 
        this.status = 'pending';
        this.value = undefined;
        this.reaseon = undefined;

        this.onFultilledCallbacks = [];
        this.onRejectedCallbacks = [];

        let resolve = value => {
            if (this.status === 'pending') {
                this.status = 'fultilled';
                this.value = value;
                this.onFultilledCallbacks.map(fn=>fn());
            }
        };
        let reject = reaseon => {
            if (this.status === 'pending') {
                this.status = 'rejected';
                this.reaseon = reaseon;
                this.onRejectedCallbacks.map(fn=>fn());
            }
        };
        //回调 函数
        try {
            exeutor(resolve, reject);
        } catch (error) {
            reject(error);
        }

    }

    then(onFultilled, onRejected) {

  onFultilled=typeof onFultilled==='function' ? onFultilled:value=>value;
  onRejected=typeof onRejected==='function' ? onRejected:err=>{throw err};

        let Promise2 = new Promise((resolve, reject) => {
            if (this.status === 'fultilled') {
                setTimeout(() => {
                    try {
                        let x = onFultilled(this.value);
                        resolvePromise(Promise2, x, resolve, reject);
                    } catch (error) {
                        reject(error);
                    }

                }, 0);

            }
            if (this.status === 'rejected') {
                setTimeout(() => {
                    try {
                        let x = onRejected(this.reaseon);
                        resolvePromise(Promise2, x, resolve, reject);
                    } catch (error) {
                        reject(error);
                    }
                }, 0);
            }
            if (this.status === 'pending') {
                this.onFultilledCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onFultilled(this.value);
                            resolvePromise(Promise2, x, resolve, reject);
                        } catch (error) {
                            reject(error);
                        }
                    }, 0);
                })
                this.onRejectedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onRejected(this.reaseon);
                            resolvePromise(Promise2, x, resolve, reject);
                        } catch (error) {
                            reject(error);
                        }
                    }, 0);
                })
            }
        })
        return Promise2;
    }
}

function resolvePromise(Promise2, x, resolve, reject) {
    if (x === Promise2) {
        return reject(new TypeError('你已经 循环引用 了 '))
    }
    //判断X 是不是一个  函数或者 对象    
    let  called;
    if (x != null && (typeof x === 'function' || typeof x === 'object')) {
        
        //取出then方法
        try {
            let then=x.then;//这个then方法采用 definedProperty定义的
            if (typeof  then==='function') {
                //如果then不是一个函数  说明不是 promise对象
                then.call(x,(y)=>{
                    if (called)  return ; 
                    called=true;
                  resolvePromise(Promise2,y,resolve,reject);
                },r=>{
                    if (called)  return;
                    called=true;
                    reject(r);
                });//等同于  x.then[this]

            }else{
                //x=[then:'123']  说明是一个普通对象 返回成功态逻辑 
                resolve(x);
            }
        } catch (e) {
            if (called)   return;
            called=true;
            reject(e);//取then方法失败  直接 触发Promise2的失败逻辑
        }
        
    }
    else {
        //    x 不是一个promise 代表就是一个普通数    直接 执行resolve
        resolve(x);
    }
}

Promise.defer = Promise.deferred = function () {
    let dfd = {}
    dfd.promise = new Promise((resolve,reject)=>{
      dfd.resolve = resolve;
      dfd.reject = reject;
    });
    return dfd;
  }
  module.exports = Promise;