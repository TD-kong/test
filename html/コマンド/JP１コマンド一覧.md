# JP1コマンド一覧（実務向け）

## 1. 概要
本資料は、JP1運用でよく使用するコマンドをまとめた一覧である。
対象は主にジョブ管理（JP1/AJS）を想定する。

---

# 2. ジョブ操作コマンド

|コマンド|説明|使用例|
|---|---|---|
|jajs_spoolview|ジョブ実行結果確認|`jajs_spoolview -h`|
|jpqjob|ジョブ状態確認|`jpqjob`|
|jpqtree|ジョブネット状態確認|`jpqtree -a`|
|jpqevent|イベント確認|`jpqevent`|
|jpause|ジョブ停止|`jpause -h`|
|jresume|ジョブ再開|`jresume -h`|
|jstop|ジョブ強制停止|`jstop -h`|
|jexec|ジョブ実行|`jexec -h`|

---

# 3. ジョブネット管理

|コマンド|説明|使用例|
|---|---|---|
|jbslist|ジョブネット一覧取得|`jbslist`|
|jbsget|定義情報取得|`jbsget`|
|jbschg|ジョブネット変更|`jbschg`|
|jbsimport|定義インポート|`jbsimport file.def`|
|jbsexport|定義エクスポート|`jbsexport file.def`|

---

# 4. 実行監視

|コマンド|説明|使用例|
|---|---|---|
|jpqjob|ジョブ確認|`jpqjob -ah`|
|jpqtree|ジョブネット確認|`jpqtree -ah`|
|jajs_spoolview|標準出力・エラー確認|`jajs_spoolview`|

---

# 5. イベント管理

|コマンド|説明|使用例|
|---|---|---|
|jpevtget|イベント取得|`jpevtget`|
|jpevtput|イベント発行|`jpevtput`|
|jpevtlist|イベント一覧|`jpevtlist`|

---

# 6. エージェント管理

|コマンド|説明|使用例|
|---|---|---|
|jping|疎通確認|`jping host`|
|jpcmd|リモートコマンド実行|`jpcmd host ls`|

---

# 7. サービス操作

|コマンド|説明|使用例|
|---|---|---|
|jstart|JP1サービス起動|`jstart`|
|jstop|JP1サービス停止|`jstop`|
|jbsstop|JP1/AJS停止|`jbsstop`|
|jbsstart|JP1/AJS起動|`jbsstart`|

---

# 8. 障害調査でよく使うコマンド

```bash
jpqjob -ah
jpqtree -ah
jajs_spoolview
jping <host>
```

---

# 9. 実務でよく使う確認手順

## ジョブ異常時
1. `jpqjob -ah` で異常ジョブ確認
2. `jajs_spoolview` で標準出力確認
3. OSログ確認
4. リラン可否判断

## ジョブ未起動時
1. `jpqtree -ah` 確認
2. 先行ジョブ状態確認
3. イベント待ち有無確認
4. スケジュール確認

