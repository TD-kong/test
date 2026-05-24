# Java 単体テスト規約（実務向け）

## 目次

- [1. はじめに](#1-はじめに)
- [2. 基本方針](#2-基本方針)
- [3. テスト対象範囲](#3-テスト対象範囲)
- [4. テストケース作成規約](#4-テストケース作成規約)
- [5. テストメソッド命名規約](#5-テストメソッド命名規約)
- [6. テストデータ規約](#6-テストデータ規約)
- [7. Assert規約](#7-assert規約)
- [8. Mock利用規約](#8-mock利用規約)
- [9. DB依存規約](#9-db依存規約)
- [10. 例外試験規約](#10-例外試験規約)
- [11. Reflection利用規約](#11-reflection利用規約)
- [12. Coverage規約](#12-coverage規約)
- [13. 禁止事項](#13-禁止事項)
- [14. レビュー観点](#14-レビュー観点)
- [15. 実務TIPS](#15-実務tips)

---

# 1. はじめに

本規約は、Java単体テストの品質・保守性・再現性向上を目的とする。

対象：

- Javaバッチ
- Serviceクラス
- Utilityクラス
- Controller
- DAO（Mock対象）

対象外：

```text
JSP
画面動作
DB結合試験
```

---

# 2. 基本方針

## 1. 単体テストは自動化する

NG：

```text
目視確認
```

OK：

```text
JUnit実施
```

---

## 2. 正常系・異常系を必ず作る

最低：

```text
正常系
異常系
境界値
```

---

## 3. DB非依存原則

Mock化。

NG：

```text
本番DB依存
```

OK：

```text
Mockito
```

---

## 4. テストは独立性を持つ

順番依存禁止。

NG：

```text
test1成功後にtest2
```

---

## 5. 再実行可能

何回実行しても同じ結果。

---

# 3. テスト対象範囲

## 必須

- 分岐
- 例外
- null
- 境界値
- エラーコード

---

## if

すべて通す。

NG：

```java
if (flag)
```

trueのみ。

OK：

```text
true
false
```

両方。

---

## switch

全case。

---

## try-catch

catchも試験。

---

# 4. テストケース作成規約

## AAAパターン

### Arrange

準備。

### Act

実行。

### Assert

検証。

例：

```java
@Test
public void test() {

    // Arrange
    User user =
            new User();

    // Act
    String result =
            service.execute(user);

    // Assert
    assertEquals(
            "OK",
            result);
}
```

---

## テストケース粒度

1メソッド1観点。

NG：

```text
正常 + 異常
```

混在。

---

## ケース命名

表形式推奨。

| No | ケース |
|---|---|
| 1 | 正常 |
| 2 | null |
| 3 | 空文字 |
| 4 | 最大桁 |
| 5 | 異常 |

---

# 5. テストメソッド命名規約

## 日本語推奨（実務）

例：

```java
正常系_会員取得できる()
異常系_nullの場合例外()
境界値_最大桁()
```

---

## 英語版

```java
testFindUser_Normal()
```

---

## 命名形式

```text
正常系_
異常系_
境界値_
```

推奨。

---

# 6. テストデータ規約

## 意味ある値

NG：

```java
"user1"
```

OK：

```java
"正常会員"
```

---

## 定数化

OK：

```java
private static final String USER_ID =
        "A001";
```

---

## 固定日時

NG：

```java
LocalDate.now()
```

理由：

再現不可。

OK：

```java
LocalDate.of(2025,1,1)
```

---

# 7. Assert規約

## 必ず検証

NG：

```java
service.execute();
```

だけ。

---

## assertEquals

優先。

```java
assertEquals(
        expected,
        actual);
```

---

## assertTrue

乱用禁止。

NG：

```java
assertTrue(result);
```

OK：

```java
assertEquals(
        STATUS_OK,
        result);
```

---

## assertNotNull

必要時。

---

## verify

Mock呼び出し確認。

```java
verify(dao)
        .insert();
```

---

# 8. Mock利用規約

## DBアクセスMock

対象：

```text
DAO
API
外部IF
```

---

## when

戻り値制御。

```java
when(userDao.find())
        .thenReturn(user);
```

---

## doThrow

例外。

```java
doThrow(
    new SQLException())
    .when(dao)
    .insert();
```

---

## verify

回数確認。

```java
verify(
    dao,
    times(1))
    .update();
```

---

# 9. DB依存規約

## DB直アクセス禁止

単体テストではMock。

---

## Integration Test分離

DB接続ありは別。

---

## SQL結果Mock化

OK：

```java
when(dao.select())
```

---

# 10. 例外試験規約

## JUnit4推奨

try-catch。

```java
@Test
public void 異常系_例外() {

    try {

        service.execute();

        fail();

    } catch (Exception e) {

        assertEquals(
            "MSG001",
            e.getMessage()
        );
    }
}
```

---

## assertThrows（JUnit5）

```java
assertThrows(
        Exception.class,
        () -> execute());
```

---

## メッセージ確認

必須。

NG：

```java
catch確認のみ
```

---

# 11. Reflection利用規約

## private直接試験

原則禁止。

推奨：

```text
public経由
```

---

## 例外

複雑ロジックのみ。

例：

```java
method.invoke()
```

---

## accessibility戻す

推奨。

---

# 12. Coverage規約

目安：

| 種類 | 目標 |
|---|---|
| Statement | 80%以上 |
| Branch | 70%以上 |

---

## カバレッジ信仰禁止

100%でも意味ない。

---

# 13. 禁止事項

- DB依存
- sleep使用
- System.out.println
- assertなし
- 複数観点混在
- private強引試験
- 実行順依存

---

# 14. レビュー観点

- 正常異常あるか
- nullあるか
- 境界値あるか
- assert十分か
- Mock適切か
- DB依存ないか
- 命名分かるか
- 例外確認十分か

---

# 15. 実務TIPS

## JUnit4現場多い

重点：

```java
@Test
@Before
assertEquals
Mockito
verify
```

---

## Reflection普通に使う

レガシー現場。

---

## if漏れ多い

false系忘れ注意。

---

## DAOはMock

DB接続禁止多い。

---

## SpotBugs警告

戻り値無視注意。

例：

```java
verify(mock);
```

戻り値無視警告。

対策：

```java
verify(mock)
        .execute();
```

---

# あなた向けポイント

あなたの現場向け優先順位：

1. JUnit4
2. Mockito
3. Reflection
4. 例外試験
5. DB非依存
6. verify
7. 大量分岐試験
