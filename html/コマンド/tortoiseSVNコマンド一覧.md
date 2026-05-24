# TortoiseSVN コマンド一覧

## 目次

- [1. TortoiseSVNとは](#1-tortoisesvnとは)
- [2. 基本操作](#2-基本操作)
- [3. よく使うSVN操作](#3-よく使うsvn操作)
- [4. 差分・比較](#4-差分比較)
- [5. 競合（Conflict）対応](#5-競合conflict対応)
- [6. 履歴確認](#6-履歴確認)
- [7. ブランチ操作](#7-ブランチ操作)
- [8. TortoiseProcコマンドライン](#8-tortoiseprocコマンドライン)
- [9. 実務サンプル](#9-実務サンプル)
- [10. 実務TIPS](#10-実務tips)

---

# 1. TortoiseSVNとは

Windows Explorer統合型のSVNクライアント。

特徴：

- GUI操作
- 差分確認しやすい
- WinMerge連携可能
- Eclipse不要

主用途：

- Java改修
- SQL管理
- 設計書管理
- リリース資材管理

---

# 2. 基本操作

## Checkout

初回取得。

右クリック：

```text
SVN Checkout
```

URL指定：

```text
svn://server/project
```

または：

```text
http://svnserver/repos/project
```

---

## Update

最新取得。

右クリック：

```text
SVN Update
```

ショートカット的操作：

```text
右クリック → SVN Update
```

頻出。

---

## Commit

変更反映。

```text
SVN Commit
```

コミットコメント必須。

例：

```text
#1234 バッチ不具合修正
```

---

## Revert

変更取消。

```text
TortoiseSVN
 ↓
Revert
```

ローカル変更破棄。

注意。

---

## Cleanup

ロック解除。

```text
Cleanup
```

よくあるエラー：

```text
working copy locked
```

対処。

---

# 3. よく使うSVN操作

## Add

新規追加。

```text
Add
```

未管理ファイル追加。

---

## Delete

削除。

```text
Delete
```

SVN管理下削除。

---

## Rename

名前変更。

```text
Rename
```

履歴維持される。

---

## Resolve

競合解消。

```text
Resolved
```

---

## Export

SVN情報なし取得。

```text
Export
```

リリース資材向け。

---

# 4. 差分比較

## Diff

差分確認。

```text
Diff
```

用途：

- Java差分
- SQL差分
- 設計書差分

---

## Diff with previous version

前版比較。

```text
Diff with previous version
```

レビュー向き。

---

## Show changes

変更一覧。

```text
Check for modifications
```

頻出。

---

## 外部比較ツール

WinMerge設定可能。

例：

```text
WinMerge
Beyond Compare
```

---

# 5. 競合（Conflict）対応

## 更新競合

例：

```text
filename.java.mine
filename.java.r123
filename.java.r124
```

生成。

---

## 対応フロー

1.

```text
Update
```

↓

2.

```text
Edit conflicts
```

↓

3.

差分解消

↓

4.

```text
Resolved
```

↓

5.

```text
Commit
```

---

## Mine / Theirs

| 用語 | 意味 |
|---|---|
| Mine | 自分変更 |
| Theirs | SVN側変更 |

---

# 6. 履歴確認

## Show log

履歴確認。

```text
Show log
```

見れる：

- 誰が
- いつ
- 何を
- コメント

---

## Revision比較

```text
Compare revisions
```

---

## Blame

誰が変更したか。

```text
Blame
```

Java保守で頻出。

---

# 7. ブランチ操作

## Branch/Tag

作成。

```text
Branch/Tag
```

例：

```text
/trunk
/branches
/tags
```

---

## Merge

マージ。

```text
Merge
```

注意操作。

---

## Switch

ブランチ切替。

```text
Switch
```

---

# 8. TortoiseProcコマンドライン

実行ファイル：

```bat
"C:\Program Files\TortoiseSVN\bin\TortoiseProc.exe"
```

---

## Update

```bat
TortoiseProc.exe /command:update /path:"C:\work"
```

---

## Commit

```bat
TortoiseProc.exe /command:commit /path:"C:\work"
```

---

## Log

```bat
TortoiseProc.exe /command:log /path:"C:\work"
```

---

## Diff

```bat
TortoiseProc.exe /command:diff /path:"test.java"
```

---

## Cleanup

```bat
TortoiseProc.exe /command:cleanup /path:"C:\work"
```

---

## Revert

```bat
TortoiseProc.exe /command:revert /path:"C:\work"
```

---

## Checkout

```bat
TortoiseProc.exe ^
/command:checkout ^
/url:"http://svnserver/repos/project" ^
/path:"C:\work"
```

---

# 9. 実務サンプル

## 作業開始

```text
1. SVN Update
2. 修正
3. Diff確認
4. 単体試験
5. Commit
```

---

## Java改修レビュー

```text
右クリック
 ↓
Diff with previous version
```

---

## SQL差分確認

```text
before.sql
after.sql
```

比較。

---

## locked解除

```text
Cleanup
```

---

## 誤修正取消

```text
Revert
```

---

# 10. 実務TIPS

## 1. 作業前に必ず Update

競合防止。

---

## 2. Commit前に Diff

必須。

不要修正防止。

---

## 3. Cleanup覚える

SVN壊れた時の第一手。

---

## 4. Revertは危険

元に戻せない。

---

## 5. Commitコメント規約

悪い例：

```text
修正
```

良い例：

```text
#2456 ログ出力不具合修正
```

---

## 6. Javaなら whitespace 差分注意

フォーマッタ差分を確認。

---

# 実務頻出TOP15

| 操作 | 用途 |
|---|---|
| Update | 最新取得 |
| Commit | 反映 |
| Diff | 差分 |
| Revert | 戻す |
| Cleanup | ロック解除 |
| Show log | 履歴 |
| Blame | 犯人探し |
| Add | 新規 |
| Delete | 削除 |
| Resolve | 競合 |
| Export | 配布 |
| Branch | 分岐 |
| Merge | マージ |
| Switch | 切替 |
| Check for modifications | 変更確認 |

---

# 保守現場あるある

## Update忘れ

→ Conflict地獄

---

## Commit前Diff見ない

→ 不要改修混入

---

## Cleanup知らない

→ 詰む

---

## Revert誤爆

→ 泣く
