# Java基礎研修（第4版・実務発展編）

> 第4版では、新卒が現場配属後に遭遇しやすい技術を扱います。
>
> 『コードを書く』から『読んで修正できる』へ進むことが目的です。

# 目次

- Generics
- Stream API
- Lambda式
- Optional
- 例外設計
- リフレクション
- SpotBugs / Checkstyle
- デバッグ方法
- SQL連携
- Javaバッチ実装例
- 設計書とコードの関係
- 実務演習

---

# 1. Generics

```java
List<String> names = new ArrayList<>();
```

`<String>` を Generics（ジェネリクス）という。

意味：

> Stringしか入れられない

NG

```java
names.add(100);
```

### 実務理由

型安全。

コンパイル時にミス発見できる。

---

# 2. Stream API

繰り返しを簡潔に書く。

従来

```java
for (String name : names) {
    System.out.println(name);
}
```

Stream

```java
names.stream()
     .forEach(System.out::println);
```

### 注意

新人はまず for を理解。

いきなり Stream 深追い不要。

---

# 3. Lambda式

短く書く。

```java
names.forEach(name -> {
    System.out.println(name);
});
```

### 意味

```text
引数 -> 処理
```

---

# 4. Optional

null安全。

```java
Optional<String> name = Optional.ofNullable(value);
```

実務で見る。

ただし乱用注意。

---

# 5. 例外設計

NG

```java
catch (Exception e)
```

だけ。

理由：

原因不明になりやすい。

実務例

```java
catch (SQLException e)
```

### ログ

```java
logger.error("DBエラー", e);
```

---

# 6. リフレクション

動的呼び出し。

```java
method.invoke(obj);
```

### よく遭遇

JUnit

Framework

Spring

### 注意

読めなくなるので乱用しない。

---

# 7. SpotBugs / Checkstyle

品質チェック。

### SpotBugs

バグ検出。

例

戻り値無視。

### Checkstyle

コーディング規約違反。

例

- 命名
- インデント
- コメント量

---

# 8. デバッグ

最重要。

## ブレークポイント

止める。

## Step Over

次へ。

## Step Into

中へ。

## 変数監視

中身を見る。

### コツ

予想してから実行。

> iは今いくつ？

を考える。

---

# 9. SQL連携

JavaではSQLを読む力重要。

例

```sql
SELECT *
FROM EMPLOYEE
WHERE ID = ?
```

### ?

プレースホルダ。

SQLインジェクション対策。

---

# 10. Javaバッチ実装例

構造

```text
Main
 ↓
InputCheck
 ↓
Service
 ↓
DAO
 ↓
DB
```

例

```java
public class Main {

    public static void main(String[] args) {

        EmployeeService service =
                new EmployeeService();

        service.execute();
    }
}
```

### 実務ポイント

mainに全部書かない。

---

# 11. 設計書とコード

基本設計

> 何を作る

詳細設計

> どう作る

ソースコード

> 実装

### 新人コツ

設計書を先に読む。

---

# 12. 実務演習

## 課題

CSV取込バッチ

仕様

1. CSV読込
2. 入力チェック
3. DB登録
4. ログ出力
5. エラー件数出力

使う要素

- List
- if
- try-catch
- method
- class
- log
- SQL

---

# 現場で強い新人の特徴

1. エラーを読める
2. 調べ方が上手い
3. printデバッグできる
4. SQL読める
5. メソッドを追える
6. 分からない場所を言語化できる

---

# 最後に

新人時代は

> 分からないのが普通

です。

重要なのは

> 『どこまで分かって、どこから分からないか』

を説明できることです。

