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
    {
      "type": "chrome",
      "request": "attach",
      "name": "Attach to Chrome",
      "port": 9222,
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

inspired by http://www7b.biglobe.ne.jp/~khiguchi/Tech/fem/femHtml5.html
