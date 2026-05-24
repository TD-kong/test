# Java コーディング規約（実務向け）

## 目次

- [1. はじめに](#1-はじめに)
- [2. 基本方針](#2-基本方針)
- [3. 命名規約](#3-命名規約)
- [4. フォーマット規約](#4-フォーマット規約)
- [5. クラス設計規約](#5-クラス設計規約)
- [6. 定数規約](#6-定数規約)
- [7. メソッド規約](#7-メソッド規約)
- [8. 条件分岐・ループ規約](#8-条件分岐ループ規約)
- [9. Null対策](#9-null対策)
- [10. 例外処理規約](#10-例外処理規約)
- [11. ログ出力規約](#11-ログ出力規約)
- [12. DBアクセス規約](#12-dbアクセス規約)
- [13. コメント規約](#13-コメント規約)
- [14. セキュリティ規約](#14-セキュリティ規約)
- [15. 性能規約](#15-性能規約)
- [16. 禁止事項](#16-禁止事項)
- [17. レビュー観点](#17-レビュー観点)
- [18. 実務TIPS](#18-実務tips)

---

# 1. はじめに

本規約は、Javaソースコードの品質・可読性・保守性を向上させるためのガイドラインである。

対象：

- Java業務システム
- Webシステム
- Javaバッチ
- 保守改修

目的：

- 可読性向上
- 属人化防止
- バグ削減
- レビュー効率化

---

# 2. 基本方針

## 原則

### 1. 読みやすさ優先

短さより可読性。

NG：

```java
if(a!=null&&b!=null&&x==1){
```

OK：

```java
if (a != null
        && b != null
        && x == 1) {

```

---

### 2. 意味が伝わるコード

NG：

```java
int a;
```

OK：

```java
int userCount;
```

---

### 3. 魔法値禁止

NG：

```java
if (status == 9)
```

OK：

```java
if (status == STATUS_ERROR)
```

---

### 4. 例外を握りつぶさない

NG：

```java
catch (Exception e) {
}
```

OK：

```java
catch (Exception e) {
    log.error("処理失敗", e);
    throw e;
}
```

---

# 3. 命名規約

## クラス名

### UpperCamelCase

OK：

```java
UserService
OrderBatch
```

NG：

```java
userService
USERSERVICE
```

---

## メソッド名

### lowerCamelCase

OK：

```java
findUser()
updateStatus()
```

---

### 動詞始まり

| 動詞 | 用途 |
|---|---|
| get | 取得 |
| find | 検索 |
| select | DB取得 |
| create | 作成 |
| update | 更新 |
| delete | 削除 |
| execute | 実行 |
| validate | チェック |

---

## 変数名

意味が分かる名前。

NG：

```java
String str;
```

OK：

```java
String userName;
```

---

## boolean

is / has。

OK：

```java
isSuccess
hasError
```

---

## 定数

### UPPER_SNAKE_CASE

```java
private static final String ERROR_MSG;
```

---

# 4. フォーマット規約

## 波括弧

必ず改行。

OK：

```java
if (flag) {
    execute();
}
```

NG：

```java
if(flag){execute();}
```

---

## インデント

### 半角スペース4

```java
if (flag) {
    execute();
}
```

---

## 1行100文字以内推奨

長い場合：

```java
commonLog.output(
        LOG_LEVEL_INFO,
        MESSAGE_ID,
        userId,
        status,
        message);
```

---

# 5. クラス設計規約

## 1クラス1責務

NG：

```text
User登録
CSV出力
メール送信
```

全部入り。

---

## Service / DAO 分離

例：

```text
UserService
UserDao
```

---

## Utility乱用禁止

何でもUtil禁止。

---

# 6. 定数規約

## final化

```java
private static final int MAX_COUNT = 100;
```

---

## ログメッセージ定数化

OK：

```java
private static final String LOG_START =
        "処理開始";
```

---

## SQL直書き注意

NG：

```java
String sql =
"select * from user";
```

---

# 7. メソッド規約

## 100行以内推奨

長いなら分割。

---

## 引数多すぎ禁止

NG：

```java
execute(a,b,c,d,e,f,g);
```

改善：

```java
RequestDto dto
```

---

## returnは明確

NG：

```java
return true;
```

OK：

```java
return isUpdateSuccess;
```

---

# 8. 条件分岐・ループ規約

## ネスト浅く

NG：

```java
if(a){
    if(b){
        if(c){
```

OK：

```java
if (!a) {
    return;
}
```

---

## else不要なら早期return

推奨。

---

# 9. Null対策

## nullチェック

OK：

```java
if (user == null) {
    return;
}
```

---

## Yoda禁止

NG：

```java
if (null == user)
```

OK：

```java
if (user == null)
```

---

# 10. 例外処理規約

## Exception乱用禁止

NG：

```java
catch (Exception e)
```

OK：

```java
catch (SQLException e)
```

---

## メッセージ出力

```java
log.error(
    "DB更新失敗 userId={}",
    userId,
    e);
```

---

# 11. ログ出力規約

## 開始終了ログ

```java
log.info("処理開始");
log.info("処理終了");
```

---

## 業務キー出力

OK：

```java
userId
orderId
```

---

## 個人情報禁止

NG：

```java
password
cardNo
```

---

# 12. DBアクセス規約

## SELECT *

禁止。

NG：

```sql
SELECT *
```

OK：

```sql
SELECT
    USER_ID,
    USER_NAME
```

---

## COMMIT位置明確

バッチ注意。

---

## SQLインジェクション対策

必ず：

```java
PreparedStatement
```

---

# 13. コメント規約

## なぜを書く

NG：

```java
// if
```

OK：

```java
// 未ログイン時は終了
```

---

## コメント率30%超推奨（現場依存）

---

# 14. セキュリティ規約

- ハードコード禁止
- パスワードログ禁止
- SQLインジェクション対策
- XSS考慮

---

# 15. 性能規約

## String連結

NG：

```java
for (...) {
    str += value;
}
```

OK：

```java
StringBuilder
```

---

## DB inside loop禁止

NG：

```java
for (...) {
    dao.select();
}
```

---

## 大量件数考慮

commit単位。

---

# 16. 禁止事項

- System.out.println
- SELECT *
- catch(Exception)
- 未使用変数
- コメントアウト放置
- 長大メソッド
- 深すぎるネスト

---

# 17. レビュー観点

- 命名適切か
- Null安全か
- 例外処理あるか
- ログ十分か
- SQL性能問題ないか
- 定数化されているか
- 可読性高いか

---

# 18. 実務TIPS

## 大規模現場あるある

### SpotBugs

警告ゼロ必須。

---

### SonarLint

導入多い。

---

### Checkstyle

厳格。

---

### 長いログメソッド

改行OK：

```java
commonLog.output(
        LOG_LEVEL_INFO,
        MESSAGE_ID,
        userId,
        status,
        message);
```

---

### static import便利

```java
import static Const.*;
```

長い定数対策。
