# Java応用研修（新卒向け）

> Java基礎修了者向け
>
> 本資料では、**現場でコードを読んで修正できる新人**になることを目的とします。

---

# 目次

- オブジェクト指向
- 継承
- ポリモーフィズム
- インタフェース
- 抽象クラス
- Collection応用
- Generics
- Stream API
- Lambda式
- Optional
- 例外設計
- ログ
- ファイル処理
- DBアクセス
- JDBC
- Transaction
- Javaバッチ
- JSP/Servlet連携
- MVCモデル
- JUnit4
- Mockito基礎
- リフレクション
- デバッグ
- 実務コード読解
- 卒業課題

---

# 1. オブジェクト指向

考え方。

> 「データ」と「処理」をまとめる

例：社員

```java
public class Employee {

    private String name;

    public void work() {
        System.out.println("働く");
    }
}
```

---

# 2. 継承

機能を引き継ぐ。

```java
public class Animal {
    public void eat() {
        System.out.println("食べる");
    }
}

public class Dog extends Animal {
}
```

使用

```java
Dog dog = new Dog();
dog.eat();
```

### 実務

共通処理化。

ただし継承しすぎ注意。

---

# 3. ポリモーフィズム

親型で扱う。

```java
Animal dog = new Dog();
```

メリット

差し替え可能。

---

# 4. インタフェース

ルール定義。

```java
public interface Payment {
    void pay();
}
```

実装

```java
public class CreditPayment
        implements Payment {

    @Override
    public void pay() {
        System.out.println("支払う");
    }
}
```

### 実務

DIやMock化で大量使用。

---

# 5. 抽象クラス

共通処理＋強制。

```java
public abstract class Animal {

    public void sleep() {
        System.out.println("寝る");
    }

    public abstract void sound();
}
```

---

# 6. Collection応用

### List

順番あり。

### Set

重複なし。

### Map

Key / Value。

使い分け重要。

---

# 7. Stream API

絞り込み。

```java
names.stream()
     .filter(name -> name.startsWith("田"))
     .forEach(System.out::println);
```

---

# 8. Optional

null安全。

```java
Optional.ofNullable(name)
        .orElse("未設定");
```

---

# 9. 例外設計

```java
try {

} catch (SQLException e) {
    logger.error("DBエラー", e);
}
```

### 方針

握りつぶさない。

---

# 10. ログ

レベル

```text
INFO
WARN
ERROR
DEBUG
```

実務では println 禁止が多い。

---

# 11. ファイル処理

CSV読込。

```java
BufferedReader br =
        new BufferedReader(
        new FileReader(file));
```

---

# 12. JDBC

流れ

```text
Connection
 ↓
PreparedStatement
 ↓
ResultSet
```

### プレースホルダ

```java
WHERE ID = ?
```

SQLインジェクション対策。

---

# 13. Transaction

途中失敗時戻す。

```java
commit();
rollback();
```

超重要。

---

# 14. Javaバッチ

典型構造

```text
入力
 ↓
Validation
 ↓
DB取得
 ↓
加工
 ↓
登録
 ↓
ログ
```

大量データでは commit 単位意識。

---

# 15. JSP / Servlet

構造

```text
JSP
 ↓
Servlet
 ↓
Service
 ↓
DAO
 ↓
DB
```

新人が最初に迷子になる場所。

---

# 16. MVCモデル

```text
Model → Java
View → JSP
Controller → Servlet
```

---

# 17. JUnit4

```java
@Test
public void testAdd() {
    assertEquals(3, add(1, 2));
}
```

### 観点

正常
異常
境界値

---

# 18. Mockito

Mock化。

```java
when(service.get())
        .thenReturn(data);
```

DB依存除外。

---

# 19. リフレクション

```java
method.invoke(obj);
```

JUnitで遭遇しやすい。

---

# 20. デバッグ

- Breakpoint
- Step Into
- Step Over
- Variables

### コツ

予想してから実行。

---

# 21. 実務コード読解

読む順番。

```text
Controller
 ↓
Service
 ↓
DAO
 ↓
SQL
```

全部読まない。

まず入口。

---

# 22. 卒業課題

## 社員管理システム

機能

- ログイン
- 一覧
- 検索
- 登録
- 更新
- 削除

要件

- JSP
- Java
- DB
- JUnit
- ログ
- Exception

---

# 現場で強い新人

1. エラー読める
2. SQL読める
3. デバッグできる
4. 質問が具体的
5. 調査メモを残す

---

# 最後に

現場では

> 『全部分かる人』

より

> 『分からないを切り分けられる人』

が強いです。

