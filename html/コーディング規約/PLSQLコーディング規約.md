# PL/SQL コーディング規約（実務向け / Oracle想定）

## 目次

- [1. はじめに](#1-はじめに)
- [2. 基本方針](#2-基本方針)
- [3. 命名規約](#3-命名規約)
- [4. フォーマット規約](#4-フォーマット規約)
- [5. Procedure / Function設計規約](#5-procedure--function設計規約)
- [6. Package規約](#6-package規約)
- [7. 変数規約](#7-変数規約)
- [8. SQL記述規約](#8-sql記述規約)
- [9. Cursor規約](#9-cursor規約)
- [10. Exception規約](#10-exception規約)
- [11. Transaction規約](#11-transaction規約)
- [12. ログ出力規約](#12-ログ出力規約)
- [13. 性能規約](#13-性能規約)
- [14. コメント規約](#14-コメント規約)
- [15. セキュリティ規約](#15-セキュリティ規約)
- [16. 禁止事項](#16-禁止事項)
- [17. レビュー観点](#17-レビュー観点)
- [18. 実務TIPS](#18-実務tips)

---

# 1. はじめに

本規約は、PL/SQLの可読性・保守性・性能・安全性向上を目的とする。

対象：

- Function
- Procedure
- Package
- Trigger
- バッチSQL
- 運用SQL

想定：

```text
Oracle業務システム
大規模バッチ
金融
官公庁
基幹システム
```

---

# 2. 基本方針

## 1. 可読性優先

短く書くより読みやすく。

NG：

```sql
IF V_CNT=0 THEN
```

OK：

```sql
IF v_exists_count = 0 THEN
```

---

## 2. SQLは縦書き

NG：

```sql
SELECT * INTO v_name FROM USER_MST WHERE ID=1;
```

OK：

```sql
SELECT
    USER_NAME
INTO
    v_user_name
FROM
    USER_MST
WHERE
    USER_ID = p_user_id;
```

---

## 3. 責務分離

Function：

```text
値返却
```

Procedure：

```text
更新処理
```

Package：

```text
機能まとめ
```

---

## 4. 例外を握り潰さない

NG：

```sql
EXCEPTION
    WHEN OTHERS THEN
        NULL;
```

OK：

```sql
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
```

---

# 3. 命名規約

## Procedure

接頭辞推奨：

```text
PR_
```

例：

```text
PR_UPDATE_USER
PR_SEND_MAIL
```

---

## Function

接頭辞推奨：

```text
FN_
```

例：

```text
FN_ENCRYPT
FN_GET_STATUS
```

---

## Package

接頭辞推奨：

```text
PKG_
```

例：

```text
PKG_USER
PKG_ENCRYPT
```

---

## 引数

### IN

```text
P_
```

例：

```sql
P_USER_ID
```

---

## OUT

```text
O_
```

---

## IN OUT

```text
IO_
```

---

## ローカル変数

```text
V_
```

例：

```sql
V_USER_NAME
```

---

## 定数

```text
C_
```

例：

```sql
C_STATUS_OK
```

---

## Cursor

```text
CUR_
```

例：

```sql
CUR_USER
```

---

# 4. フォーマット規約

## キーワード大文字

OK：

```sql
SELECT
INSERT
UPDATE
BEGIN
END
```

---

## インデント4スペース

OK：

```sql
IF condition THEN
    UPDATE USER_MST
    SET STATUS = '1';
END IF;
```

---

## BEGIN / END対応

OK：

```sql
BEGIN

END;
/
```

---

## 1行100文字以内推奨

---

# 5. Procedure / Function設計規約

## Function

副作用禁止。

NG：

```sql
UPDATE
```

含む。

OK：

```text
値返却のみ
```

---

## Procedure

更新系。

OK：

```text
INSERT
UPDATE
DELETE
```

---

## OUT乱用禁止

NG：

```text
OUTが10個
```

---

## return明確

OK：

```sql
RETURN v_result;
```

---

# 6. Package規約

## Package化推奨

関連処理をまとめる。

例：

```text
PKG_ENCRYPT
```

中：

```text
暗号化
復号化
鍵取得
```

---

## Specification / Body分離

必須。

---

# 7. 変数規約

## %TYPE利用

推奨。

NG：

```sql
V_USER_ID VARCHAR2(20);
```

OK：

```sql
V_USER_ID USER_MST.USER_ID%TYPE;
```

理由：

型変更耐性。

---

## 初期化

推奨。

OK：

```sql
V_CNT NUMBER := 0;
```

---

## Magic Number禁止

NG：

```sql
IF status = 9
```

---

# 8. SQL記述規約

## SELECT *

禁止。

---

## INTO明示

OK：

```sql
SELECT
    USER_NAME
INTO
    V_USER_NAME
```

---

## COUNT(*)

存在確認注意。

NG：

```sql
SELECT COUNT(*)
```

だけ。

場合により：

```sql
EXISTS
```

優先。

---

## WHERE必須

UPDATE / DELETE。

---

# 9. Cursor規約

## FOR LOOP推奨

NG：

```sql
OPEN
FETCH
CLOSE
```

OK：

```sql
FOR rec IN CUR_USER LOOP
END LOOP;
```

---

## Cursor命名

```text
CUR_
```

---

## BULK COLLECT

大量件数向け。

---

# 10. Exception規約

## NO_DATA_FOUND

必須考慮。

OK：

```sql
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN NULL;
```

---

## TOO_MANY_ROWS

考慮。

---

## WHEN OTHERS

必ずログ。

NG：

```sql
WHEN OTHERS THEN
    NULL;
```

OK：

```sql
WHEN OTHERS THEN
    RAISE_APPLICATION_ERROR(
        -20001,
        SQLERRM
    );
```

---

## 独自例外

推奨。

```sql
E_INVALID_DATA EXCEPTION;
```

---

# 11. Transaction規約

## COMMIT禁止（原則）

Procedure内：

NG：

```sql
COMMIT;
```

理由：

呼出元制御不能。

---

## Java側制御

推奨。

---

## 大量更新

commit分割検討。

例：

```text
1000件ごと
```

---

# 12. ログ出力規約

## 処理開始終了

OK：

```text
開始
終了
件数
```

---

## SQLCODE / SQLERRM

必須。

OK：

```sql
SQLCODE
SQLERRM
```

---

## 業務キー出力

OK：

```text
USER_ID
ORDER_ID
```

---

# 13. 性能規約

## LOOP内SQL禁止

NG：

```sql
FOR rec IN LOOP

    SELECT

END LOOP;
```

改善：

```sql
JOIN
BULK COLLECT
FORALL
```

---

## EXISTS活用

存在確認。

---

## Index考慮

NG：

```sql
TO_CHAR(COL)
```

WHERE句。

---

## explain plan確認

必須。

---

# 14. コメント規約

## なぜを書く

NG：

```sql
-- update
```

OK：

```sql
-- 有効ユーザのみ更新
```

---

## Headerコメント

推奨。

```sql
/*
処理名：
概要：
作成日：
作成者：
*/
```

---

# 15. セキュリティ規約

## 動的SQL注意

NG：

```sql
EXECUTE IMMEDIATE
```

乱用。

---

## SQL Injection注意

パラメータ化。

---

## 暗号鍵直書き禁止

NG：

```sql
KEY='ABC123'
```

---

# 16. 禁止事項

- SELECT *
- COMMIT乱発
- WHEN OTHERS NULL
- LOOP内SQL
- Magic Number
- 巨大Procedure
- 長すぎるPackage
- 動的SQL乱用

---

# 17. レビュー観点

- Function更新してないか
- COMMIT適切か
- Exception十分か
- SQL性能問題ないか
- %TYPE使っているか
- WHERE漏れないか
- 可読性高いか
- ログ十分か

---

# 18. 実務TIPS

## Functionは値返却だけ

現場ではかなり重要。

---

## Procedureで更新

基本。

---

## Oracle例外頻出

```sql
NO_DATA_FOUND
TOO_MANY_ROWS
VALUE_ERROR
DUP_VAL_ON_INDEX
```

覚える。

---

## 暗号化Function

例：

```text
FN_ENCRYPT
FN_DECRYPT
```

---

## 鍵更新

Procedure推奨。

例：

```text
PR_UPDATE_KEY
```

（version increment + insert）

---

## 大量更新

60万件超：

```text
FORALL
BULK COLLECT
MERGE
INSERT SELECT
```

優先。

---

# あなた向けポイント

重点：

1. Function / Procedure違い
2. Package
3. Exception
4. %TYPE
5. COMMIT位置
6. LOOP性能
7. FORALL / BULK COLLECT
