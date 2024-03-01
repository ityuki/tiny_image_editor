// storage class
const Storage = self.Storage = class Storage {
  constructor(main) {
    this.main = main;
  }
  #realKeyPrefixName(){
    return APP_ID + "_" + this.main.tieName + "_";
  }
  #realKeyName(key) {
    return this.#realKeyPrefixName() + key;
  }
  save(key, value) {
    localStorage.setItem(this.#realKeyName(key),JSON.stringify(value));
  }
  load(key, defaultValue) {
    if (defaultValue === undefined) defaultValue = null;
    const v = localStorage.getItem(this.#realKeyName(key));
    if (v === null) return defaultValue;
    try{
      return JSON.parse(v);
    }catch(e){
      console.log(e);
      return defaultValue;
    }
  }
  delete(key) {
    localStorage.removeItem(this.#realKeyName(key));  
  }
  keys(prefix) {
    const r = [];
    const gprefx = this.#realKeyPrefixName();
    if (prefix === undefined || prefix === null) prefix = '';
    for (let i = 0; i < localStorage.length; i++) {
      const name = localStorage.key(i);
      if (name !== '') {
        if (name.startsWith(gprefx)) {
          const n = name.substring(gprefx.length);
          if (n.startsWith(prefix)){
            r.push(n.substring(prefix.length));
          }
        }
      } 
    }
    return r;
  }
  clear(prefix) {
    if (prefix === undefined || prefix == null) prefix = '';
    for(let k of this.keys(prefix)) {
      this.delete(k);
    }
  }
  clearAllStorageData(){
    localStorage.clear();
  }
}
