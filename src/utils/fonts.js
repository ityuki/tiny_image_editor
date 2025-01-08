// fonts class
// fonts Sample
/*
console.log(Fonts.getFontNames());
*/
const Fonts = self.Fonts = class Fonts {
  static fontlist = [];
  static init = false;
  static fonthash = {};
  static getFontNames() {
    if (!Fonts.init){
      return null;
    }
    const r = [];
    for (let font of Fonts.fontlist){
      r.push(font.name);
    }
    return r;
  }
  static getFontLangs (name){
    if (!Fonts.init){
      return null;
    }
    return Fonts.fonthash[name].lang;
  }
  static {
    window.addEventListener('fontfamily_list-loaded',function(event){
      const fontfamily_list = event.detail;
      Fonts.fontlist = fontfamily_list;
      for (let font of fontfamily_list){
        Fonts.fonthash[font.name] = {
          lang: font.lang,
        };
      }
      Fonts.init = true;
    });
  };
};


