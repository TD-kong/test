# AIX コマンド一覧

## 目次

- [1. 基本操作](#1-基本操作)
- [2. ファイル操作](#2-ファイル操作)
- [3. ログ確認](#3-ログ確認)
- [4. プロセス確認](#4-プロセス確認)
- [5. ディスク・ファイルシステム](#5-ディスクファイルシステム)
- [6. メモリ・CPU確認](#6-メモリcpu確認)
- [7. ネットワーク](#7-ネットワーク)
- [8. ユーザー操作](#8-ユーザー操作)
- [9. JP1・バッチ運用系](#9-jp1バッチ運用系)
- [10. AIX固有コマンド](#10-aix固有コマンド)
- [11. 実務頻出TOP30](#11-実務頻出top30)

---

# 1. 基本操作

## pwd

現在ディレクトリ表示。

```sh
pwd
```

---

## ls

ファイル一覧。

```sh
ls
```

詳細表示：

```sh
ls -l
```

日時順：

```sh
ls -ltr
```

隠しファイル含む：

```sh
ls -la
```

---

## cd

ディレクトリ移動。

```sh
cd /tmp
```

ホームへ：

```sh
cd ~
```

---

## clear

画面クリア。

```sh
clear
```

---

## history

実行履歴。

```sh
history
```

---

# 2. ファイル操作

## cat

ファイル表示。

```sh
cat test.log
```

最新ログ確認で多用。

---

## more

1ページずつ表示。

```sh
more test.log
```

終了：

```text
q
```

---

## tail

末尾表示。

```sh
tail test.log
```

リアルタイム監視：

```sh
tail -f test.log
```

---

## head

先頭表示。

```sh
head test.log
```

---

## cp

コピー。

```sh
cp file1.txt file2.txt
```

---

## mv

移動・リネーム。

```sh
mv old.txt new.txt
```

---

## rm

削除。

```sh
rm file.txt
```

強制削除：

```sh
rm -f file.txt
```

フォルダごと：

```sh
rm -rf temp
```

※本番注意

---

## mkdir

ディレクトリ作成。

```sh
mkdir backup
```

---

## chmod

権限変更。

```sh
chmod 755 script.sh
```

---

## chown

所有者変更。

```sh
chown oracle:dba test.txt
```

---

# 3. ログ確認

## grep

文字検索。

```sh
grep ERROR app.log
```

件数確認：

```sh
grep ERROR app.log | wc -l
```

---

## find

ファイル検索。

```sh
find /tmp -name "*.log"
```

更新日検索：

```sh
find . -mtime -1
```

---

## wc

件数確認。

```sh
wc -l test.txt
```

---

## sort

ソート。

```sh
sort file.txt
```

---

## uniq

重複除去。

```sh
uniq file.txt
```

---

# 4. プロセス確認

## ps

プロセス確認。

```sh
ps -ef
```

grep付き：

```sh
ps -ef | grep java
```

---

## kill

プロセス停止。

```sh
kill -9 12345
```

---

## topas

CPU・メモリ監視。

```sh
topas
```

AIX版 top。

終了：

```text
q
```

---

## vmstat

性能確認。

```sh
vmstat 1 10
```

1秒間隔で10回。

---

# 5. ディスク・ファイルシステム

## df

ディスク容量。

```sh
df -g
```

GB表示。

---

## du

フォルダ容量。

```sh
du -sg *
```

---

## mount

マウント確認。

```sh
mount
```

---

# 6. メモリ・CPU確認

## lsattr

CPU確認。

```sh
lsattr -El sys0
```

---

## prtconf

ハード構成。

```sh
prtconf
```

メモリ確認：

```sh
prtconf | grep Memory
```

---

## lparstat

LPAR情報。

```sh
lparstat -i
```

仮想CPU確認で多用。

---

# 7. ネットワーク

## ping

疎通確認。

```sh
ping server01
```

---

## netstat

ポート確認。

```sh
netstat -an
```

LISTENのみ：

```sh
netstat -an | grep LISTEN
```

---

## ifconfig

IP確認。

```sh
ifconfig -a
```

---

## nslookup

名前解決。

```sh
nslookup hostname
```

---

# 8. ユーザー操作

## whoami

ログインユーザー。

```sh
whoami
```

---

## who

ログイン一覧。

```sh
who
```

---

## passwd

パスワード変更。

```sh
passwd
```

---

## su

ユーザー切替。

```sh
su - oracle
```

---

# 9. JP1・バッチ運用系

## nohup

バックグラウンド実行。

```sh
nohup sh batch.sh &
```

---

## crontab

ジョブ確認。

```sh
crontab -l
```

編集：

```sh
crontab -e
```

---

## 実行中ジョブ確認

```sh
ps -ef | grep batch
```

---

## ログ監視

```sh
tail -f batch.log
```

---

# 10. AIX固有コマンド

## errpt

エラーログ確認。

```sh
errpt
```

詳細：

```sh
errpt -a
```

障害調査で頻出。

---

## lslpp

インストール一覧。

```sh
lslpp -l
```

特定確認：

```sh
lslpp -l | grep java
```

---

## smit

設定GUI。

```sh
smit
```

高速版：

```sh
smitty
```

AIX特有。

---

## lspv

物理ボリューム。

```sh
lspv
```

---

## lsvg

VG確認。

```sh
lsvg
```

---

## lsdev

デバイス一覧。

```sh
lsdev -Cc disk
```

---

# 11. 実務頻出TOP30

| コマンド | 用途 |
|---|---|
| `ls -ltr` | 最新ファイル確認 |
| `cat` | ログ確認 |
| `tail -f` | ログ監視 |
| `grep` | エラー検索 |
| `find` | ファイル検索 |
| `ps -ef` | プロセス確認 |
| `kill -9` | 強制停止 |
| `df -g` | 容量確認 |
| `du -sg` | サイズ確認 |
| `topas` | 性能確認 |
| `vmstat` | CPU監視 |
| `netstat -an` | ポート確認 |
| `ifconfig -a` | IP確認 |
| `nohup` | バックグラウンド |
| `crontab -l` | ジョブ確認 |
| `errpt` | 障害確認 |
| `lslpp -l` | ソフト確認 |
| `smitty` | AIX設定 |
| `lspv` | PV確認 |
| `lsvg` | VG確認 |

---

# 実務TIPS

## 最新ファイルを開く

```sh
cat $(ls -t *.log | head -1)
```

ログ末尾確認：

```sh
tail -100 $(ls -t *.log | head -1)
```

---

## エラーだけ確認

```sh
grep -i error *.log
```

---

## 大量ログ検索

```sh
find . -name "*.log" | xargs grep ERROR
```

---

## 容量不足調査

```sh
du -sg * | sort -nr
```
