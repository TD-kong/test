# Cシェル（csh/tcsh）コーディング規約

## 1. 目的
本規約は、Cシェル（csh/tcsh）で作成するシェルスクリプトの可読性・保守性・障害解析性を向上させることを目的とする。

## 2. 基本方針
- 可読性を最優先とする
- 障害発生時にログのみで原因調査可能とする
- 相対パスを禁止し絶対パスを使用する
- 異常終了時は終了コードを返却する

## 3. 命名規約
### 3.1 ファイル名
- 小文字スネークケースを使用
- `処理名_用途.csh`

OK:
```csh
import_customer_batch.csh
```

NG:
```csh
IMPORT.CSH
batch1.csh
```

### 3.2 変数名
- ローカル変数：小文字スネークケース
- 定数：大文字

```csh
set input_file = "/work/input.txt"
set RET_OK = 0
```

## 4. コメント規約
処理単位でコメントを記載する。

```csh
# 入力ファイル存在確認
if (! -f $input_file) then
    echo "ERROR: file not found"
    exit 9
endif
```

## 5. インデント規約
- 半角スペース4つ
- タブ禁止

## 6. 条件分岐
### if文
OK:
```csh
if ($status != 0) then
    echo "ERROR"
    exit 9
endif
```

NG:
```csh
if($status!=0)then
 echo ERROR
endif
```

## 7. foreach規約
```csh
foreach file ($file_list)
    echo $file
end
```

## 8. 外部コマンド
- grep, awk, sed使用時は目的をコメント記載
- パイプの多段利用を避ける

## 9. エラー処理
外部コマンド実行後は `$status` を確認する。

```csh
cp $src $dest
if ($status != 0) then
    echo "ERROR: copy failed"
    exit 9
endif
```

## 10. ログ出力
日時付きログを推奨。

```csh
echo "`date '+%Y-%m-%d %H:%M:%S'` INFO Start"
```

## 11. 一時ファイル
PIDを付与する。

```csh
set temp_file = "/tmp/work_$$.tmp"
```

## 12. 終了コード
|コード|意味|
|---|---|
|0|正常終了|
|1|警告|
|9|異常終了|

## 13. 禁止事項
- 相対パス
- マジックナンバー
- ワンライナー過多
- エラーチェック未実施

## 14. レビューチェックリスト
- 命名規約遵守
- ログ出力あり
- `$status`確認あり
- exit code定義あり
- コメントあり

## 15. テンプレート
```csh
#!/bin/csh

set RET_OK = 0
set RET_ERROR = 9

# 開始ログ
echo "`date '+%Y-%m-%d %H:%M:%S'` INFO START"

# 主処理
ls -l
if ($status != 0) then
    echo "ERROR: command failed"
    exit $RET_ERROR
endif

# 終了ログ
echo "`date '+%Y-%m-%d %H:%M:%S'` INFO END"
exit $RET_OK
```

