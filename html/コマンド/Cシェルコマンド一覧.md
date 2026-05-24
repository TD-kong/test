# C Shell（csh）コマンド一覧

## 目次

- [1. 基本構文](#1-基本構文)
- [2. 変数操作](#2-変数操作)
- [3. 条件分岐](#3-条件分岐)
- [4. ループ](#4-ループ)
- [5. ファイル操作](#5-ファイル操作)
- [6. プロセス操作](#6-プロセス操作)
- [7. ログ・出力制御](#7-ログ出力制御)
- [8. 日付操作](#8-日付操作)
- [9. 実務サンプル](#9-実務サンプル)
- [10. よく使うコマンドTOP20](#10-よく使うコマンドtop20)

---

# 1. 基本構文

## シェル宣言

```csh
#!/bin/csh
```

または：

```csh
#!/bin/tcsh
```

---

## コメント

```csh
# コメント
```

---

## echo

文字出力。

```csh
echo "Hello"
```

---

## exit

終了。

```csh
exit 0
```

異常終了：

```csh
exit 1
```

---

## source

別シェル読み込み。

```csh
source env.csh
```

---

# 2. 変数操作

## set

変数定義。

```csh
set NAME = "Tanaka"
echo $NAME
```

### 注意

`=` の前後にスペース必要。

❌ NG

```csh
set NAME="Tanaka"
```

⭕ OK

```csh
set NAME = "Tanaka"
```

---

## setenv

環境変数。

```csh
setenv JAVA_HOME /usr/java
```

確認：

```csh
echo $JAVA_HOME
```

---

## 数値計算

```csh
@ NUM = 1 + 1
echo $NUM
```

---

## コマンド結果格納

```csh
set DATE = `date`
echo $DATE
```

バッククォート使用。

---

# 3. 条件分岐

## if

### 基本

```csh
if ($NUM == 1) then
    echo "OK"
endif
```

---

## if else

```csh
if ($NUM == 1) then
    echo "正常"
else
    echo "異常"
endif
```

---

## ファイル存在確認

```csh
if (-f test.txt) then
    echo "存在"
endif
```

---

## ディレクトリ確認

```csh
if (-d /tmp) then
    echo "あり"
endif
```

---

## 条件一覧

| 条件 | 意味 |
|---|---|
| `-f` | ファイル存在 |
| `-d` | ディレクトリ存在 |
| `-e` | 存在確認 |
| `-r` | 読み取り可 |
| `-w` | 書込み可 |
| `-x` | 実行可 |

---

# 4. ループ

## foreach

cshの基本ループ。

```csh
foreach FILE (*.log)
    echo $FILE
end
```

---

## 数値ループ

```csh
@ i = 1

while ($i <= 10)
    echo $i
    @ i++
end
```

---

# 5. ファイル操作

## cp

コピー。

```csh
cp test.txt backup.txt
```

---

## mv

移動・リネーム。

```csh
mv old.txt new.txt
```

---

## rm

削除。

```csh
rm test.txt
```

強制：

```csh
rm -f test.txt
```

---

## mkdir

ディレクトリ作成。

```csh
mkdir work
```

---

## chmod

権限変更。

```csh
chmod 755 test.sh
```

---

# 6. プロセス操作

## ps

プロセス確認。

```csh
ps -ef
```

grep付き：

```csh
ps -ef | grep java
```

---

## kill

停止。

```csh
kill -9 12345
```

---

## nohup

バックグラウンド。

```csh
nohup ./batch.csh &
```

---

# 7. ログ・出力制御

## リダイレクト

### 上書き

```csh
echo "start" > result.log
```

---

### 追記

```csh
echo "end" >> result.log
```

---

### 標準出力＋エラー出力

```csh
./batch.csh >& result.log
```

実務頻出。

---

## tee

画面＋ログ。

```csh
./batch.csh | tee result.log
```

---

# 8. 日付操作

## date

現在日付。

```csh
date
```

---

## YYYYMMDD取得

```csh
set TODAY = `date +%Y%m%d`
echo $TODAY
```

---

## ログ名生成

```csh
set LOG = log_`date +%Y%m%d`.txt
```

---

# 9. 実務サンプル

## ログ出力付きバッチ

```csh
#!/bin/csh

set LOG = batch.log

echo "処理開始" > $LOG

ls -ltr >> $LOG

echo "処理終了" >> $LOG

exit 0
```

---

## ファイル存在チェック

```csh
#!/bin/csh

if (-f input.txt) then
    echo "ファイルあり"
else
    echo "ファイルなし"
    exit 1
endif
```

---

## エラー判定

```csh
#!/bin/csh

sqlplus /nolog @test.sql

if ($status != 0) then
    echo "SQL異常"
    exit 1
endif

echo "正常終了"
```

`$status` は超重要。

---

## 最新ログ確認

```csh
cat `ls -t *.log | head -1`
```

末尾100件：

```csh
tail -100 `ls -t *.log | head -1`
```

---

## 大量ファイル処理

```csh
foreach FILE (*.dat)
    echo $FILE
    mv $FILE backup/
end
```

---

# 10. よく使うコマンドTOP20

| コマンド | 用途 |
|---|---|
| `set` | 変数 |
| `setenv` | 環境変数 |
| `echo` | 出力 |
| `if` | 条件分岐 |
| `foreach` | ループ |
| `while` | ループ |
| `$status` | 終了コード |
| `source` | 別シェル |
| `nohup` | バックグラウンド |
| `ps -ef` | プロセス |
| `grep` | 検索 |
| `tail -f` | ログ監視 |
| `find` | 検索 |
| `df -g` | 容量 |
| `du -sg` | サイズ |
| `chmod` | 権限 |
| `rm -f` | 削除 |
| `cp` | コピー |
| `mv` | 移動 |
| `date` | 日付 |

---

# csh実務注意点

## 1. `=` 前後スペース必須

```csh
set NAME = "A"
```

---

## 2. `foreach` の終わりは `end`

bashの `done` ではない。

---

## 3. 終了コードは `$status`

```csh
if ($status != 0) then
```

---

## 4. bash記法を混ぜない

❌ NG

```sh
VAR=value
```

⭕ csh

```csh
set VAR = value
```

---

## 5. AIX現場では `ksh` 混在多い

見分け：

```sh
echo $SHELL
```

- `/bin/csh`
- `/bin/tcsh`
- `/bin/ksh`

を確認。
