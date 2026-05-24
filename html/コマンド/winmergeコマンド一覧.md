# WinMerge コマンド一覧

## 目次

- [1. WinMergeとは](#1-winmergeとは)
- [2. 基本起動コマンド](#2-基本起動コマンド)
- [3. オプション一覧](#3-オプション一覧)
- [4. ファイル比較](#4-ファイル比較)
- [5. フォルダ比較](#5-フォルダ比較)
- [6. 実務サンプル](#6-実務サンプル)
- [7. バッチ連携](#7-バッチ連携)
- [8. ショートカットキー](#8-ショートカットキー)
- [9. 実務TIPS](#9-実務tips)

---

# 1. WinMergeとは

WinMergeは、**ファイル差分比較ツール**。

主用途：

- ソース差分比較
- SQL比較
- 設計書比較
- 設定ファイル比較
- エビデンス比較
- フォルダ差分確認

実務ではかなり使用頻度が高い。

---

# 2. 基本起動コマンド

## EXEパス

一般例：

```bat
"C:\Program Files\WinMerge\WinMergeU.exe"
```

---

## ファイル比較

```bat
WinMergeU.exe file1.txt file2.txt
```

例：

```bat
WinMergeU.exe before.sql after.sql
```

---

## フォルダ比較

```bat
WinMergeU.exe C:\src_old C:\src_new
```

---

# 3. オプション一覧

| オプション | 説明 |
|---|---|
| `/e` | 単一インスタンス |
| `/u` | MRU更新なし |
| `/wl` | 左側を読取専用 |
| `/wr` | 右側を読取専用 |
| `/dl` | 左タイトル |
| `/dr` | 右タイトル |
| `/noninteractive` | 非対話 |
| `/minimize` | 最小起動 |
| `/maximize` | 最大起動 |
| `/xq` | 終了確認なし |
| `/cp` | 比較結果保存 |
| `/ignorews` | 空白無視 |
| `/ignoreblanklines` | 空行無視 |

---

## 左右タイトル

```bat
WinMergeU.exe old.sql new.sql ^
/dl "変更前" ^
/dr "変更後"
```

---

## 読み取り専用

```bat
WinMergeU.exe file1.txt file2.txt /wl /wr
```

事故防止。

---

## 空白無視

```bat
WinMergeU.exe a.java b.java /ignorews
```

インデント差分除外。

---

## 空行無視

```bat
WinMergeU.exe a.txt b.txt /ignoreblanklines
```

---

# 4. ファイル比較

## SQL比較

```bat
WinMergeU.exe before.sql after.sql
```

用途：

- 改修差分確認
- SQLレビュー

---

## Java比較

```bat
WinMergeU.exe OldBatch.java NewBatch.java
```

用途：

- 修正箇所確認
- レビュー

---

## 設定ファイル比較

```bat
WinMergeU.exe web.xml web_new.xml
```

---

# 5. フォルダ比較

## ソース比較

```bat
WinMergeU.exe ^
C:\old_source ^
C:\new_source
```

---

## リリース差分

```bat
WinMergeU.exe ^
release_before ^
release_after
```

---

## フィルタ付き

```bat
WinMergeU.exe src1 src2 /f "*.java"
```

Javaのみ比較。

---

# 6. 実務サンプル

## 1. SQL修正差分

```bat
@echo off

set WM="C:\Program Files\WinMerge\WinMergeU.exe"

%WM% before.sql after.sql ^
/dl "修正前" ^
/dr "修正後"
```

---

## 2. 設計書差分

```bat
WinMergeU.exe ^
basic_design_v1.md ^
basic_design_v2.md
```

---

## 3. エビデンス比較

```bat
WinMergeU.exe ^
result_old.log ^
result_new.log
```

障害調査向き。

---

## 4. 本番・検証差分

```bat
WinMergeU.exe ^
prd.properties ^
stg.properties
```

設定漏れ検知。

---

## 5. Javaフォルダ比較

```bat
WinMergeU.exe ^
src_old ^
src_new ^
/ignorews
```

---

# 7. バッチ連携

## バッチ起動

```bat
@echo off

set WINMERGE="C:\Program Files\WinMerge\WinMergeU.exe"

set BEFORE=C:\work\before
set AFTER=C:\work\after

%WINMERGE% %BEFORE% %AFTER%
```

---

## TeraTermログ比較

```bat
WinMergeU.exe ^
log_before.txt ^
log_after.txt
```

運用保守向き。

---

## OracleDDL比較

```bat
WinMergeU.exe ^
table_before.sql ^
table_after.sql
```

---

# 8. ショートカットキー

| キー | 用途 |
|---|---|
| `F5` | 再比較 |
| `F7` | 次差分 |
| `Shift+F7` | 前差分 |
| `Alt+↓` | 左→右コピー |
| `Alt+↑` | 右→左コピー |
| `Ctrl+F` | 検索 |
| `Ctrl+G` | 行移動 |
| `Ctrl+Q` | 終了 |

---

# 9. 実務TIPS

## 1. `/ignorews` は必須級

Java整形差分を消せる。

```bat
/ignorews
```

---

## 2. 本番ファイルは読取専用

事故防止。

```bat
/wl /wr
```

---

## 3. レビュー時はタイトル付与

分かりやすい。

```bat
/dl "修正前"
/dr "修正後"
```

---

## 4. フォルダ比較が強い

リリース差分で超便利。

---

## 5. エビデンス比較で使える

ログ差分：

```text
正常系
異常系
性能試験
```

比較に便利。

---

# 実務頻出TOP10

| コマンド | 用途 |
|---|---|
| `WinMergeU.exe file1 file2` | ファイル比較 |
| `WinMergeU.exe dir1 dir2` | フォルダ比較 |
| `/ignorews` | 空白無視 |
| `/ignoreblanklines` | 空行無視 |
| `/wl /wr` | 読取専用 |
| `/dl /dr` | タイトル |
| `/f "*.java"` | 拡張子指定 |
| `F7` | 次差分 |
| `Alt+↓` | 左→右反映 |
| `F5` | 再比較 |
