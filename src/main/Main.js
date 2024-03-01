// Main (export) class
const Main = self.Main = class Main {
  constructor(targetObj, tieName, bodyObj) {
    this.targetObj = targetObj;
    if (tieName === undefined || tieName === null) {
      tieName = 'default';
    }
    this.tieName = tieName;
    if (bodyObj === undefined || bodyObj === null){
      bodyObj = document.getElementsByClassName("BODY")[0];
    }
    this.bodyObj = bodyObj;
    this.storage = new self.browser.Storage(this);
  }
  static $tie = $tie;
}
console.log(this)
