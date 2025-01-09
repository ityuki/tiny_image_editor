const Buildsys = (function(){
  const app = this.app = this;
  const modules = app.modules = {};
  let g_window = null;
  if (typeof window !== 'undefined') {
    g_window = window;
  }
  app.g_window = g_window;
  const APP_NAME = app.APP_NAME = "buildsys sample";
  const APP_ID = app.APP_ID = "buildsys";
  const APP_RID = app.APP_RID = "$" + APP_ID;
  const $buildsys = app.$buildsys = app;
  const APP_VERSION = app.APP_VERSION = "0.0.1";

  const self = this;
  const parent = self.parent = arguments[0] || {};
  const __MODULE_THIS__ = self.__MODULE_THIS__ = self;
  const __MODULE_PARENT__ = self.__MODULE_PARENT__ = null;
  const __MODULE_NAME__ = self.__MODULE_NAME__ = app.APP_ID;
// ================================================
// source: main.js
// ================================================
const Main = self.Main = class Main {
  constructor(){
    this.$sample = Main.$sample;
    this.version = app.APP_VERSION;

    console.log("This is a " + app.APP_NAME + " version " + this.version + " rev. 0abb0f03161dff8ecf7ef37e34bc86498b17a4f4 (2025-01-09 10:44:34.961 JST)");
  }
  static $sample = app;
};

return Main;
}).call({},{
  importlib: {
  }
});
