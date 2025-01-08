# fontfamily_list

* フォントファミリーで使用できるものの一覧を取得し、`fontfamily_list-loaded`イベントにいれて返します。
* `fontfamily_list`の1要素は、次のプロパティで構成されています。
    * `name` : フォントファミリー名
    * `lang` : 使用出来る言語一覧
        * `ja` : 日本語使用可能フォントならtrue
        * `zh` : 中国語使用可能フォントならtrue
        * `ko` : 韓国語使用可能フォントならtrue
        * `ru` : ロシア語使用可能フォントならtrue

## sample

* 基本的には、sample.htmlが全てです。

### 読み込み

```html
<head>
 <script src="fontfamily_list.js" type="text/javascript" charset="UTF-8" ></script>
</head>
```

### 使用

```html
  var fontfamily_list = []
  window.addEventListener('fontfamily_list-loaded',function(event){
    fontfamily_list = event.detail
    var w = document.getElementById("data")
    var d = ""
    for(var i=0;i<fontfamily_list.length;i++){
        var fontfamily = fontfamily_list[i]
        d += fontfamily.name
        d += " : "
        for (var key in fontfamily.lang){
            d += key
            d += "="
            d += fontfamily.lang[key]
            d += " &nbsp; "
        }
        d += "<br>";
    }
    w.innerHTML = d
  });
```

## ライセンス
* 本プログラムは、MIT Licenseです
* 内部で使用しているフォントは、OFL-1.1 License（Adobe Blank）です


