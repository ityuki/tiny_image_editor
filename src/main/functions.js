const regExpEscape = self.regExpEscape = function regExpEscape(str) {
  return str.replace(/[-\/\\^$*+?.()|\[\]{}]/g, '\\$&');
};
