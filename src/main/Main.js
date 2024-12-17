// Main (export) class
const Main = self.Main = class Main {
  constructor(targetObj, tieName, bodyObj) {
    this.$tie = Main.$tie;
    this.window = app.g_window;
    this.targetObj = targetObj;
    if (tieName === undefined || tieName === null) {
      tieName = 'default';
    }
    this.tieName = tieName;
    if (bodyObj === undefined || bodyObj === null){
      bodyObj = app.g_window.document.getElementsByTagName("body")[0];
    }
    this.bodyObj = bodyObj;
    this.storage = new modules.browser.Storage(this,this.window);
    this.history = {
      maxdepth: -1,
    };
  }
  static $tie = $tie;
}
