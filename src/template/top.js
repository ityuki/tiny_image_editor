const Tie = (function(){
  const app = this.app = this;
  const modules = app.modules = {};
  const global = app.global = arguments[0];
  const APP_ID = app.APP_ID = "tie";
  const $tie = app.$tie = app;

  const self = this;
  const __MODULE_PARENT__ = self.__MODULE_PARENT__ = null;
  const __MODULE_NAME__ = self.__MODULE_NAME__ = app.APP_ID;
