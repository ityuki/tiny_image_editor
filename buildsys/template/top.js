const @TOP_MODULE_NAME@ = (function(){
  const app = this.app = this;
  const modules = app.modules = {};
  const g_window = app.g_window = window;
  const APP_NAME = app.APP_NAME = "@APP_NAME@";
  const APP_ID = app.APP_ID = "@APP_ID@";
  const APP_RID = app.APP_RID = "$" + APP_ID;
  const $@APP_ID@ = app.$@APP_ID@ = app;

  const self = this;
  const parent = self.parent = arguments[0] || {};
  const __MODULE_THIS__ = self.__MODULE_THIS__ = self;
  const __MODULE_PARENT__ = self.__MODULE_PARENT__ = null;
  const __MODULE_NAME__ = self.__MODULE_NAME__ = app.APP_ID;
