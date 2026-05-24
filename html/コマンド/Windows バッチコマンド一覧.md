# Windows バッチコマンド一覧

## 目次

- [1. 基本構文](#1-基本構文)
- [2. ファイル・フォルダ操作](#2-ファイルフォルダ操作)
- [3. 条件分岐・制御](#3-条件分岐制御)
- [4. 変数操作](#4-変数操作)
- [5. ログ・出力制御](#5-ログ出力制御)
- [6. ネットワーク系](#6-ネットワーク系)
- [7. プロセス制御](#7-プロセス制御)
- [8. 実務サンプル](#8-実務サンプル)
- [9. よく使うコマンドTOP20](#9-よく使うコマンドtop20)

---

# 1. 基本構文

## echo

文字列出力。

### 例

```bat
echo Hello World
```

---

## @echo off

コマンド自体を非表示にする。

### 例

```bat
@echo off
echo 処理開始
```

実務ではほぼ必須。

---

## pause

一時停止。

```bat
pause
```

表示：

```text
続行するには何かキーを押してください . . .
```

---

## rem

コメント。

```bat
rem コメント
```

または：

```bat
:: コメント
```

---

## cls

画面クリア。

```bat
cls
```

---

## exit

終了。

```bat
exit /b
```

---

# 2. ファイル・フォルダ操作

## dir

ファイル一覧表示。

```bat
dir
```

詳細表示：

```bat
dir /s
```

---

## cd

ディレクトリ移動。

```bat
cd C:\work
```

現在位置表示：

```bat
cd
```

---

## mkdir (md)

フォルダ作成。

```bat
mkdir backup
```

---

## rmdir (rd)

フォルダ削除。

```bat
rmdir /s /q backup
```

| オプション | 説明 |
|---|---|
| `/s` | 配下も削除 |
| `/q` | 確認なし |

---

## copy

コピー。

```bat
copy test.txt backup\
```

---

## xcopy

フォルダ含めコピー。

```bat
xcopy C:\src C:\backup /e /y
```

---

## robocopy

高速コピー（実務推奨）。

```bat
robocopy C:\src C:\backup /mir
```

---

## del

ファイル削除。

```bat
del *.log
```

---

## ren

名前変更。

```bat
ren old.txt new.txt
```

---

# 3. 条件分岐・制御

## if

条件分岐。

### ファイル存在チェック

```bat
if exist test.txt (
    echo 存在する
)
```

---

### エラーコード判定

```bat
if %ERRORLEVEL% neq 0 (
    echo エラー
)
```

---

## goto

ラベルジャンプ。

```bat
goto ERROR

:ERROR
echo エラー終了
```

---

## call

別バッチ呼び出し。

```bat
call sub.bat
```

---

## for

ループ。

### ファイル一覧

```bat
for %%f in (*.txt) do (
    echo %%f
)
```

---

### 数値ループ

```bat
for /L %%i in (1,1,10) do (
    echo %%i
)
```

---

## timeout

待機。

```bat
timeout /t 5
```

5秒待機。

---

# 4. 変数操作

## set

変数定義。

```bat
set NAME=Tanaka
echo %NAME%
```

---

## set /a

数値計算。

```bat
set /a NUM=1+2
echo %NUM%
```

---

## set /p

入力受付。

```bat
set /p INPUT=入力してください:
```

---

## delayed expansion

遅延展開。

```bat
setlocal enabledelayedexpansion

for %%i in (1 2 3) do (
    set NUM=%%i
    echo !NUM!
)
```

実務ではループ内変数で必須。

---

# 5. ログ・出力制御

## リダイレクト

### 上書き

```bat
echo test > result.log
```

---

### 追記

```bat
echo test >> result.log
```

---

### エラー出力

```bat
dir nofile 2> error.log
```

---

### 標準出力＋エラー出力

```bat
sample.bat > result.log 2>&1
```

実務で非常によく使う。

---

# 6. ネットワーク系

## ping

疎通確認。

```bat
ping google.com
```

---

## ipconfig

IP確認。

```bat
ipconfig
```

---

## net use

ネットワークドライブ接続。

```bat
net use Z: \\server\share
```

---

# 7. プロセス制御

## tasklist

プロセス一覧。

```bat
tasklist
```

---

## taskkill

プロセス停止。

```bat
taskkill /f /im chrome.exe
```

---

## start

別プロセス起動。

```bat
start notepad.exe
```

---

# 8. 実務サンプル

## ログ取得付きバッチ

```bat
@echo off

set LOG=C:\log\result.log

echo 処理開始 > %LOG%

dir C:\temp >> %LOG% 2>&1

echo 処理終了 >> %LOG%
```

---

## ファイル存在チェック

```bat
@echo off

if exist C:\work\data.txt (
    echo ファイルあり
) else (
    echo ファイルなし
)
```

---

## バックアップ処理

```bat
@echo off

set SRC=C:\data
set DST=D:\backup

robocopy %SRC% %DST% /mir

if %ERRORLEVEL% geq 8 (
    echo 異常終了
    exit /b 1
)

echo 正常終了
```

---

## 日付付きログファイル

```bat
@echo off

set DATE=%date:~0,4%%date:~5,2%%date:~8,2%

set LOG=log_%DATE%.txt

echo start > %LOG%
```

※環境依存あり（日本語OS注意）。

---

# 9. よく使うコマンドTOP20

| コマンド | 用途 |
|---|---|
| `@echo off` | 非表示 |
| `echo` | 出力 |
| `set` | 変数 |
| `if` | 条件分岐 |
| `for` | ループ |
| `goto` | ジャンプ |
| `call` | 別バッチ |
| `timeout` | 待機 |
| `copy` | コピー |
| `xcopy` | コピー |
| `robocopy` | 高速コピー |
| `del` | 削除 |
| `mkdir` | 作成 |
| `rmdir` | 削除 |
| `dir` | 一覧 |
| `cd` | 移動 |
| `tasklist` | プロセス確認 |
| `taskkill` | 停止 |
| `ping` | 疎通 |
| `ipconfig` | IP確認 |

---

# 実務で重要な注意点

## 1. `robocopy` を使う

`xcopy` より安定。

---

## 2. `2>&1` を必ず使う

エビデンス取得時は：

```bat
sample.bat > result.log 2>&1
```

を推奨。

---

## 3. `%ERRORLEVEL%` 判定

異常終了判定必須。

```bat
if %ERRORLEVEL% neq 0 exit /b 1
```

---

## 4. `enabledelayedexpansion`

`for` 内の変数は基本これ。

```bat
setlocal enabledelayedexpansion
```
