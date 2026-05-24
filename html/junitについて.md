# JUnit3 / JUnit4 / JUnit5 まとめ

## 目次

- [1. JUnitとは](#1-junitとは)
- [2. JUnit3 / 4 / 5 比較表](#2-junit3--4--5-比較表)
- [3. JUnit3](#3-junit3)
- [4. JUnit4](#4-junit4)
- [5. JUnit5](#5-junit5)
- [6. アノテーション比較](#6-アノテーション比較)
- [7. Assert比較](#7-assert比較)
- [8. 例外テスト比較](#8-例外テスト比較)
- [9. Mock（Mockito）との関係](#9-mockmockitoとの関係)
- [10. 実務での使われ方](#10-実務での使われ方)
- [11. 移行観点](#11-移行観点)
- [12. 実務TIPS](#12-実務tips)

---

# 1. JUnitとは

Javaの**単体テストフレームワーク**。

目的：

- メソッド動作確認
- 回帰テスト
- 不具合防止
- 自動試験

例：

```java
@Test
public void testAdd() {
    assertEquals(3, add(1, 2));
}
```

---

# 2. JUnit3 / 4 / 5 比較表

| 項目 | JUnit3 | JUnit4 | JUnit5 |
|---|---|---|---|
| 登場 | 古い | 現場最多 | 最新 |
| Test継承 | 必須 | 不要 | 不要 |
| Annotation | × | ○ | ◎ |
| assertThrows | × | △ | ○ |
| Parameterized | 弱い | 普通 | 強い |
| 並列実行 | × | × | ○ |
| 学習難易度 | 高 | 普通 | 普通 |
| 実務利用 | レガシー | 最多 | 増加中 |

---

# 3. JUnit3

## 特徴

超レガシー。

特徴：

- `extends TestCase`
- 命名が `testXXX`
- アノテーションなし

---

## サンプル

```java
import junit.framework.TestCase;

public class SampleTest extends TestCase {

    public void testAdd() {

        int result = 1 + 2;

        assertEquals(3, result);
    }
}
```

---

## 特徴

### クラス継承必須

```java
extends TestCase
```

---

### test始まり必須

```java
testAdd()
```

名前依存。

---

## setUp / tearDown

前処理：

```java
protected void setUp() {
}
```

後処理：

```java
protected void tearDown() {
}
```

---

# 4. JUnit4

## 特徴

現場最多。

あなたの現場っぽい。

特徴：

- `@Test`
- annotation方式
- Mockito相性良い

---

## 基本サンプル

```java
import static org.junit.Assert.*;
import org.junit.Test;

public class SampleTest {

    @Test
    public void testAdd() {

        int result = 1 + 2;

        assertEquals(3, result);
    }
}
```

---

## 前処理

```java
@Before
public void setUp() {

}
```

---

## 後処理

```java
@After
public void tearDown() {

}
```

---

## 全テスト前

```java
@BeforeClass
public static void beforeAll() {

}
```

---

## 全テスト後

```java
@AfterClass
public static void afterAll() {

}
```

---

## 例外テスト

### expected

```java
@Test(expected = RuntimeException.class)
public void testException() {

    throw new RuntimeException();
}
```

---

### try-catch推奨

実務ではこっち多い。

```java
@Test
public void testException() {

    try {

        sample.execute();

        fail();

    } catch (Exception e) {

        assertEquals(
            "error",
            e.getMessage()
        );
    }
}
```

---

# 5. JUnit5

## 特徴

最新。

パッケージ：

```java
org.junit.jupiter
```

---

## サンプル

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SampleTest {

    @Test
    void testAdd() {

        assertEquals(3, 1 + 2);
    }
}
```

---

## 前処理

```java
@BeforeEach
void setUp() {
}
```

---

## 後処理

```java
@AfterEach
void tearDown() {
}
```

---

## 全体前処理

```java
@BeforeAll
static void beforeAll() {
}
```

---

## 例外テスト

最強。

```java
@Test
void testException() {

    Exception ex =
        assertThrows(
            RuntimeException.class,
            () -> sample.execute()
        );

    assertEquals(
        "error",
        ex.getMessage()
    );
}
```

---

# 6. アノテーション比較

| JUnit4 | JUnit5 |
|---|---|
| `@Before` | `@BeforeEach` |
| `@After` | `@AfterEach` |
| `@BeforeClass` | `@BeforeAll` |
| `@AfterClass` | `@AfterAll` |
| `@Ignore` | `@Disabled` |

---

# 7. Assert比較

## equals

```java
assertEquals(1, result);
```

---

## true

```java
assertTrue(result);
```

---

## false

```java
assertFalse(result);
```

---

## null

```java
assertNull(obj);
```

---

## not null

```java
assertNotNull(obj);
```

---

## same

同一インスタンス。

```java
assertSame(a, b);
```

---

# 8. 例外テスト比較

## JUnit4

```java
@Test(expected = Exception.class)
```

弱点：

詳細確認不可。

---

## JUnit5

```java
assertThrows()
```

推奨。

---

## 実務（JUnit4）

try-catch。

```java
try {
    execute();
    fail();
} catch(Exception e) {
}
```

多い。

---

# 9. Mock（Mockito）との関係

## mock

```java
@Mock
private UserDao dao;
```

---

## inject

```java
@InjectMocks
private UserService service;
```

---

## when

```java
when(dao.find())
    .thenReturn(data);
```

---

## verify

```java
verify(dao).insert();
```

---

# 10. 実務での使われ方

| 環境 | 主流 |
|---|---|
| レガシー | JUnit3 |
| 大企業SI | JUnit4 |
| SpringBoot | JUnit5 |
| 新規開発 | JUnit5 |

---

## 実際の印象

```text
7割 JUnit4
2割 JUnit5
1割 JUnit3
```

くらい。

---

# 11. 移行観点

## JUnit3 → 4

削除：

```java
extends TestCase
```

追加：

```java
@Test
```

---

## JUnit4 → 5

import変更。

```java
org.junit.jupiter
```

---

## expected削除

変更前：

```java
@Test(expected = Exception.class)
```

変更後：

```java
assertThrows()
```

---

# 12. 実務TIPS

## 1. まずJUnitバージョン確認

importを見る。

JUnit3：

```java
junit.framework
```

JUnit4：

```java
org.junit
```

JUnit5：

```java
org.junit.jupiter
```

---

## 2. レガシー現場はJUnit4強い

急に5にしない。

---

## 3. DB依存を避ける

Mock化。

---

## 4. try-catch例外テスト多い

現場あるある。

---

## 5. privateメソッドは直接テストしない

public経由原則。

ただし現場では：

```java
reflection
```

普通に使われる。

---

# あなた向けメモ

あなたの現場だと：

```text
JUnit4 + Mockito
reflection invoke
例外試験
DB非依存
```

の可能性が高い。

重点学習：

1. `@Test`
2. `@Before`
3. `assertEquals`
4. `Mockito when`
5. `verify`
6. 例外試験
7. Reflection
