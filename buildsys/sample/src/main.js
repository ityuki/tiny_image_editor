const Main = self.Main = class Main {
  constructor(){
    this.$sample = Main.$sample;
    this.version = app.APP_VERSION;

    console.log("This is a " + app.APP_NAME + " version " + this.version + " rev. @__REPLACE__BUILD_INFO_COMMIT__@ (@__REPLACE__BUILD_INFO_DATE_MSEC__@)");
    app.parent.importlib.test();
  }
  static $sample = app;
};
