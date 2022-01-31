# FEM3D　環境構築

## インストール
1) Google Chrome<br>
https://www.google.com/intl/ja_jp/chrome/

2) Node.js<br>
https://nodejs.org/ja/download/

3) Visual Studio Code<br>
https://code.visualstudio.com/download

## コマンド
1) `npm install`
2) `npm install -g @angular/cli`
3) `set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process`
4) `ng serve`

## launch.json書き換え後
``` json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:4200",
      "webRoot": "${workspaceFolder}"
    },
  ]
}
```

# .femファイルの詳細
https://github.com/DoboPro/FEM3D/blob/main/data/FileFormat.pdf


# 更新履歴情報(2022/01/31更新)
最新版です。


# 注意点・免責事項
本アプリのソースコードは、樋口和宏（khiguchi@kuramae.ne.jp）氏の、技術屋の魂（http://www7b.biglobe.ne.jp/~khiguchi/Tech/engineer.html) をベースに改変したものであり、本書の内容は原則として執筆時点（2022年1月）のものです。その後の状況によって変更されている情報もありますので、ご注意ください。
また本アプリの内容を適用した結果、及び適用できなかった結果から生じた、あらゆる直接的および間接的被害に対し、弊団体及び樋口氏は責任を負いかねます。
