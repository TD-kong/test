# SQL コーディング規約（実務向け / Oracle想定）

## 目次

- [1. はじめに](#1-はじめに)
- [2. 基本方針](#2-基本方針)
- [3. 命名規約](#3-命名規約)
- [4. SQLフォーマット規約](#4-sqlフォーマット規約)
- [5. SELECT規約](#5-select規約)
- [6. JOIN規約](#6-join規約)
- [7. WHERE句規約](#7-where句規約)
- [8. INSERT規約](#8-insert規約)
- [9. UPDATE規約](#9-update規約)
- [10. DELETE規約](#10-delete規約)
- [11. COMMIT / ROLLBACK規約](#11-commit--rollback規約)
- [12. NULL規約](#12-null規約)
- [13. 性能規約](#13-性能規約)
- [14. コメント規約](#14-コメント規約)
- [15. セキュリティ規約](#15-セキュリティ規約)
- [16. 禁止事項](#16-禁止事項)
- [17. レビュー観点](#17-レビュー観点)
- [18. 実務TIPS](#18-実務tips)

---

# 1. はじめに

本規約は、SQLの可読性・保守性・性能・安全性を向上することを目的とする。

対象：

- Oracle SQL
- JavaバッチSQL
- PL/SQL
- Function / Procedure
- 運用保守SQL

---

# 2. 基本方針

## 1. 可読性優先

短さより読みやすさ。

NG：

```sql
SELECT * FROM USER_MST WHERE ID=1
```

OK：

```sql
SELECT
    USER_ID,
    USER_NAME
FROM
    USER_MST
WHERE
    USER_ID = 1
```

---

## 2. SQLは縦に書く

原則改行。

---

## 3. SELECT * 禁止

理由：

- 性能悪化
- カラム追加影響
- 可読性低下

NG：

```sql
SELECT *
FROM USER_MST
```

OK：

```sql
SELECT
    USER_ID,
    USER_NAME
FROM
    USER_MST
```

---

## 4. ハードコード最小化

NG：

```sql
STATUS = '9'
```

OK：

```text
STATUS_ERROR
```

---

# 3. 命名規約

## Alias

短く意味ある名前。

OK：

```sql
USER_MST UM
ORDER_TBL OT
```

NG：

```sql
USER_MST A
ORDER_TBL B
```

---

## カラム別名

意味を明確化。

OK：

```sql
COUNT(*) AS USER_COUNT
```

---

## SQLファイル名

```text
select_user.sql
update_status.sql
```

推奨。

---

# 4. SQLフォーマット規約

## キーワード大文字

OK：

```sql
SELECT
FROM
WHERE
```

NG：

```sql
select
from
```

---

## カンマ先頭禁止

NG：

```sql
SELECT
    USER_ID
    , USER_NAME
```

OK：

```sql
SELECT
    USER_ID,
    USER_NAME
```

---

## 句ごと改行

OK：

```sql
SELECT
FROM
WHERE
GROUP BY
ORDER BY
```

---

## IN句改行

OK：

```sql
WHERE USER_ID IN (
    '001',
    '002',
    '003'
)
```

---

# 5. SELECT規約

## カラム明示

必須。

---

## DISTINCT乱用禁止

性能悪化。

NG：

```sql
SELECT DISTINCT
```

まず重複原因調査。

---

## EXISTS優先

場合により：

NG：

```sql
IN (
SELECT
```

OK：

```sql
EXISTS (
SELECT 1
```

---

## ORDER BY明示

順序保証。

NG：

```sql
SELECT *
FROM USER_MST
```

OK：

```sql
ORDER BY USER_ID
```

---

# 6. JOIN規約

## ANSI JOIN推奨

NG：

```sql
FROM A,B
WHERE A.ID = B.ID
```

OK：

```sql
FROM USER_MST UM
INNER JOIN ORDER_TBL OT
    ON UM.USER_ID = OT.USER_ID
```

---

## JOIN条件改行

OK：

```sql
ON  A.ID = B.ID
AND A.TYPE = B.TYPE
```

---

## LEFT JOIN注意

件数増加注意。

---

# 7. WHERE句規約

## 条件順序

推奨：

1. 主キー
2. 絞り込み
3. 日付
4. 状態

---

## BETWEEN注意

NG：

```sql
BETWEEN
```

理由：

時刻事故。

OK：

```sql
>=
<
```

---

## LIKE前方一致推奨

NG：

```sql
LIKE '%ABC'
```

Index効きにくい。

OK：

```sql
LIKE 'ABC%'
```

---

## OR乱用禁止

可能なら：

```sql
UNION ALL
```

検討。

---

# 8. INSERT規約

## カラム明示

必須。

NG：

```sql
INSERT INTO USER_MST
VALUES
```

OK：

```sql
INSERT INTO USER_MST (
    USER_ID,
    USER_NAME
)
VALUES (
    '001',
    '田中'
)
```

---

## INSERT SELECT

大量向け。

---

# 9. UPDATE規約

## WHERE必須

超重要。

NG：

```sql
UPDATE USER_MST
SET STATUS = '1'
```

---

## 実行前SELECT

必須。

```sql
SELECT *
```

確認。

---

## 影響件数確認

```sql
SQL%ROWCOUNT
```

---

# 10. DELETE規約

## 物理削除慎重

推奨：

```text
論理削除
```

---

## DELETE前確認

```sql
SELECT COUNT(*)
```

---

## rollback前提

推奨。

```sql
ROLLBACK
```

準備。

---

# 11. COMMIT / ROLLBACK規約

## commit位置明示

Java側管理推奨。

---

## 大量更新

commit分割。

例：

```text
1000件ごと
```

---

## auto commit禁止

---

# 12. NULL規約

## NVL使用

例：

```sql
NVL(NAME, '')
```

---

## NULL比較

NG：

```sql
= NULL
```

OK：

```sql
IS NULL
```

---

# 13. 性能規約

## Function列禁止

NG：

```sql
WHERE TO_CHAR(DATE_COL)
```

Index無効。

---

## DB inside loop回避

Java注意。

---

## EXISTS

件数存在確認。

OK：

```sql
EXISTS (
SELECT 1
```

---

## UNION

不要重複なら：

```sql
UNION ALL
```

優先。

---

## explain plan確認

必須。

---

# 14. コメント規約

## なぜを書く

NG：

```sql
-- where
```

OK：

```sql
-- 有効会員のみ取得
```

---

## 複雑SQL説明

必須。

---

# 15. セキュリティ規約

## SQL Injection対策

Java側：

```java
PreparedStatement
```

必須。

---

## 動的SQL注意

---

## 本番更新注意

WHERE確認。

---

# 16. 禁止事項

- SELECT *
- WHEREなしUPDATE
- WHEREなしDELETE
- DISTINCT乱用
- 暗黙JOIN
- %前方LIKE
- = NULL
- ORDER BYなし

---

# 17. レビュー観点

- SELECT * ないか
- Index効くか
- JOIN適切か
- WHERE漏れないか
- commit安全か
- explain確認したか
- 可読性あるか
- rollback可能か

---

# 18. 実務TIPS

## UPDATE前テンプレ

```sql
SELECT *
FROM USER_MST
WHERE USER_ID = '001';

UPDATE USER_MST
SET STATUS = '1'
WHERE USER_ID = '001';

ROLLBACK;
```

---

## 大量データ

60万件以上：

```text
INSERT SELECT
MERGE
BULK
```

検討。

---

## Oracle運用あるある

まず打つ：

```sql
SELECT COUNT(*)
```

---

## 障害調査

```sql
GROUP BY
HAVING COUNT(*) > 1
```

重複確認。

---

## explain plan

必須級。

---

# あなた向けポイント

重点：

1. JOIN
2. EXISTS
3. INSERT SELECT
4. MERGE
5. explain plan
6. rollback前提UPDATE
7. 大量件数性能
