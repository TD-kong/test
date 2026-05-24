# Java基礎研修（第3版・実務編）

> 本章では、新卒が現場で最初に困りやすい内容を扱います。
>
> 「コードが読めない」を卒業することを目的にします。

# 目次

- List
- Map
- final / 定数
- String比較（== と equals）
- null
- 例外処理
- ログ
- ファイル処理
- DBとJDBCの考え方
- Javaバッチの構造
- JSPとの関係
- JUnit入口
- 実務コードの読み方
- 卒業演習

---

# 1. List

配列の進化版。

```java
List<String> names = new ArrayList<>();

names.add("田中");
names.add("佐藤");

System.out.println(names.get(0));
```

結果

```text
田中
```

## 配列との違い

配列

```java
String[] arr = new String[3];
```

→ サイズ固定

List

→ 増やせる

### 実務

DB結果格納で大量使用。

---

# 2. Map

キーと値。

```java
Map<String, String> map = new HashMap<>();

map.put("name", "田中");

System.out.println(map.get("name"));
```

結果

```text
田中
```

### イメージ

```text
key → value
```

実務で頻出。

---

# 3. final / 定数

変更禁止。

```java
final int TAX = 10;
```

変更不可。

### 定数命名

```java
MAX_COUNT
```

大文字＋アンダースコア。

---

# 4. String比較

超重要。

NG

```java
if (name == "田中")
```

OK

```java
if ("田中".equals(name))
```

## なぜ？

```java
==
```

→ 同じ箱か比較

```java
equals
```

→ 中身比較

新人が高確率でハマる。

---

# 5. null

何もない状態。

```java
String name = null;
```

危険コード

```java
name.length();
```

結果

```text
NullPointerException
```

意味

> 中身ないのに触ろうとした

対策

```java
if (name != null)
```

---

# 6. 例外処理

```java
try {
    int x = 10 / 0;
} catch (Exception e) {
    e.printStackTrace();
}
```

### 役割

異常終了防止。

実務ではログ出力する。

---

# 7. ログ

NG

```java
System.out.println();
```

実務

```java
logger.info("開始");
logger.error("異常", e);
```

理由

- 出力制御
- ファイル保存
- 障害解析

---

# 8. ファイル処理

```java
BufferedReader br = new BufferedReader(
    new FileReader("sample.txt")
);
```

### 実務

CSV読込バッチで使う。

---

# 9. DBとJDBC

流れ

```text
Java
 ↓
SQL発行
 ↓
DB
 ↓
結果取得
```

イメージ

```java
SELECT * FROM EMPLOYEE
```

結果

```java
List<Employee>
```

へ格納。

---

# 10. Javaバッチ

典型構造

```text
main
 ↓
入力チェック
 ↓
DB取得
 ↓
加工
 ↓
DB更新
 ↓
ログ出力
```

### 大量データ

1件ずつ更新は遅い。

commit単位重要。

---

# 11. JSPとの関係

JSP

→ 画面

Java

→ 裏処理

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

---

# 12. JUnit入口

テストコード。

```java
@Test
public void 足し算() {
    assertEquals(3, add(1, 2));
}
```

### 目的

壊れてない確認。

---

# 13. 実務コードの読み方

まず読む。

```text
main
 ↓
呼び出し先
 ↓
SQL
```

全部理解しようとしない。

1メソッドずつ。

---

# 14. 卒業演習

## 課題

社員管理システムを作る。

機能

- 登録
- 一覧
- 検索
- 削除

使う要素

- List
- if
- for
- method
- class
- constructor

---

# 最後に

新人が最初に強くなるべきもの。

1. エラーを読む
2. if
3. for
4. メソッド
5. null回避
6. equals

これができると、現場コードが急に読めるようになります。

