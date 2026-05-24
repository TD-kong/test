# Sakuraエディタ マクロ機能まとめ

## 目次

- [1. Sakuraエディタのマクロとは](#1-sakuraエディタのマクロとは)
- [2. マクロの種類](#2-マクロの種類)
- [3. マクロ記録機能](#3-マクロ記録機能)
- [4. マクロ実行方法](#4-マクロ実行方法)
- [5. キーボード割り当て](#5-キーボード割り当て)
- [6. JScript / VBScript マクロ](#6-jscript--vbscript-マクロ)
- [7. よく使うマクロサンプル](#7-よく使うマクロサンプル)
- [8. 実務で使える活用例](#8-実務で使える活用例)
- [9. 実務TIPS](#9-実務tips)

---

# 1. Sakuraエディタのマクロとは

Sakuraエディタでは、**繰り返し作業を自動化**できる。

主な用途：

- 同じ編集作業を自動化
- ログ整形
- SQL整形
- カンマ区切り変換
- エビデンス整形
- コードテンプレート挿入
- 大量置換

例：

```text
AAA
BBB
CCC
```

を

```sql
'AAA',
'BBB',
'CCC'
```

へ一括変換。

---

# 2. マクロの種類

## ① 記録マクロ（簡単）

GUI操作を録画する方式。

特徴：

- ノーコード
- 操作をそのまま記録
- 簡単な繰り返し向き

---

## ② スクリプトマクロ（本格）

コードを書く方式。

利用可能：

- JScript（推奨）
- VBScript

特徴：

- 条件分岐可能
- ループ可能
- 複雑な整形可能
- 実務向き

---

# 3. マクロ記録機能

## 記録開始

メニュー：

```text
ツール
  ↓
キーマクロの記録開始
```

ショートカット：

```text
Ctrl + Shift + R
```

---

## 記録停止

```text
ツール
 ↓
キーマクロの記録終了
```

---

## 実行

```text
Ctrl + Shift + P
```

---

## 例：ログ整形

### やりたいこと

```text
AAA
BBB
CCC
```

↓

```text
・AAA
・BBB
・CCC
```

### 操作

1. 行頭へ移動
2. `・` 入力
3. 下へ移動

記録後：

```text
Ctrl + Shift + P
```

連打で自動化。

---

# 4. マクロ実行方法

## ファイル実行

メニュー：

```text
ツール
 ↓
マクロ実行
```

拡張子：

```text
.js
.vbs
```

---

## よくある保存場所

```text
C:\macro\
```

例：

```text
C:\macro\sql_format.js
```

---

# 5. キーボード割り当て

## 設定

```text
設定
 ↓
共通設定
 ↓
キー割り当て
```

---

例：

| キー | 用途 |
|---|---|
| F1 | SQL整形 |
| F2 | カンマ追加 |
| F3 | 行頭追加 |
| F4 | 引用符追加 |

実務だとかなり便利。

---

# 6. JScript / VBScript マクロ

## 基本構文（JScript）

```javascript
var text = Editor.GetSelectedString();

Editor.InsText(text);
```

---

## 選択文字取得

```javascript
var str = Editor.GetSelectedString();
```

---

## テキスト挿入

```javascript
Editor.InsText("test");
```

---

## 全文取得

```javascript
var text = Editor.GetText();
```

---

## 置換

```javascript
text = text.replace(/AAA/g, "BBB");
```

---

## 全文上書き

```javascript
Editor.SetText(text);
```

---

# 7. よく使うマクロサンプル

## 1. SQL IN句変換

### 入力

```text
A001
A002
A003
```

### 出力

```sql
'A001',
'A002',
'A003'
```

### マクロ

```javascript
var text = Editor.GetSelectedString();

var arr = text.split("\r\n");

var result = "";

for (var i = 0; i < arr.length; i++) {
    result += "'" + arr[i] + "',\r\n";
}

Editor.InsText(result);
```

---

## 2. 行頭追加

### 入力

```text
AAA
BBB
CCC
```

### 出力

```text
#AAA
#BBB
#CCC
```

### マクロ

```javascript
var text = Editor.GetSelectedString();

text = text.replace(/^/gm, "#");

Editor.InsText(text);
```

---

## 3. カンマ削除

### 入力

```text
A,
B,
C,
```

### 出力

```text
A
B
C
```

### マクロ

```javascript
var text = Editor.GetSelectedString();

text = text.replace(/,/g, "");

Editor.InsText(text);
```

---

## 4. ダブルクォート追加

### 入力

```text
AAA
BBB
```

### 出力

```text
"AAA"
"BBB"
```

### マクロ

```javascript
var text = Editor.GetSelectedString();

text = text.replace(/^(.+)$/gm, '"$1"');

Editor.InsText(text);
```

---

## 5. SQL INSERT文生成

### 入力

```text
001,TANAKA
002,SUZUKI
```

### 出力

```sql
INSERT INTO USER_MST VALUES ('001','TANAKA');
INSERT INTO USER_MST VALUES ('002','SUZUKI');
```

### マクロ

```javascript
var text = Editor.GetSelectedString();

var lines = text.split("\r\n");

var result = "";

for (var i = 0; i < lines.length; i++) {

    var cols = lines[i].split(",");

    result +=
    "INSERT INTO USER_MST VALUES ('"
    + cols[0]
    + "','"
    + cols[1]
    + "');\r\n";
}

Editor.InsText(result);
```

---

# 8. 実務で使える活用例

## SQL IN句作成

運用で最頻出。

```sql
WHERE ID IN (
'001',
'002',
'003'
)
```

---

## エビデンス整形

画面キャプチャ用に：

```text
・正常終了
・件数確認OK
・エラーなし
```

生成。

---

## ログ整形

不要部分削除。

```text
INFO
DEBUG
```

削除。

---

## Java定数化

入力：

```text
userId
password
sessionId
```

出力：

```java
private static final String USER_ID
private static final String PASSWORD
private static final String SESSION_ID
```

---

## Oracle INSERT文生成

CSVからテストデータ生成。

---

# 9. 実務TIPS

## 1. 「正規表現置換」が最強

マクロより早いことが多い。

置換：

```text
Ctrl + R
```

正規表現ON推奨。

---

## 2. よく使う変換はFキー登録

かなり時短。

---

## 3. SQL作業と相性が良い

- IN句
- INSERT生成
- UPDATE生成
- カラム整形

に強い。

---

## 4. エビデンス作成に便利

大量テキスト整形向き。

---

## 5. Git管理推奨

マクロ保管：

```text
macro/
 ├ sql/
 ├ log/
 ├ evidence/
 └ java/
```

実務で育つ資産になる。
