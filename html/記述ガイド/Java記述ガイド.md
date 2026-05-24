# Java記述ガイド（実務向け）

## 目次
- [1. 概要](#1-概要)
- [2. Javaプログラム基本構造](#2-javaプログラム基本構造)
- [3. 変数とデータ型](#3-変数とデータ型)
- [4. 演算子](#4-演算子)
- [5. 条件分岐](#5-条件分岐)
- [6. 繰り返し処理](#6-繰り返し処理)
- [7. 配列](#7-配列)
- [8. メソッド](#8-メソッド)
- [9. クラスとオブジェクト](#9-クラスとオブジェクト)
- [10. static / final](#10-static--final)
- [11. 例外処理](#11-例外処理)
- [12. コレクション](#12-コレクション)
- [13. ファイル操作](#13-ファイル操作)
- [14. ログ出力](#14-ログ出力)
- [15. 実務サンプル](#15-実務サンプル)
- [16. コーディング注意点](#16-コーディング注意点)

---

# 1. 概要

Javaは、業務システム、Webシステム、バッチ処理などで広く利用されるオブジェクト指向言語である。

特徴：

- プラットフォーム非依存
- オブジェクト指向
- 大規模開発向き
- 保守性が高い

---

# 2. Javaプログラム基本構造

```java
public class Sample {

    public static void main(String[] args) {
        System.out.println("Hello Java");
    }
}
```

基本要素：

- class
- mainメソッド
- 文末に `;`
- `{}` ブロック管理

---

# 3. 変数とデータ型

## 数値

```java
int age = 20;
long amount = 100000L;
double price = 100.5;
```

---

## 文字列

```java
String name = "Tanaka";
```

---

## 真偽値

```java
boolean result = true;
```

---

## 定数

```java
private static final String SYSTEM_NAME = "販売管理";
```

実務：

- マジックナンバー禁止
- 固定値は定数化

---

# 4. 演算子

```java
int total = a + b;
```

比較：

```java
if (score >= 80)
```

AND / OR：

```java
if (a > 0 && b > 0)
```

---

# 5. 条件分岐

## if

```java
if (age >= 20) {
    System.out.println("成人");
}
```

---

## if else

```java
if (score >= 80) {
    grade = "A";
} else {
    grade = "B";
}
```

---

## switch

```java
switch (status) {
case "0":
    message = "正常";
    break;
default:
    message = "異常";
}
```

---

# 6. 繰り返し処理

## for

```java
for (int i = 0; i < 10; i++) {
    System.out.println(i);
}
```

---

## while

```java
while (count < 10) {
    count++;
}
```

---

## 拡張for

```java
for (String name : nameList) {
    System.out.println(name);
}
```

---

# 7. 配列

```java
String[] names = {"A", "B", "C"};
```

取得：

```java
System.out.println(names[0]);
```

---

# 8. メソッド

```java
public int add(int a, int b) {
    return a + b;
}
```

呼び出し：

```java
int result = add(10, 20);
```

---

# 9. クラスとオブジェクト

```java
public class User {

    private String userId;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
```

生成：

```java
User user = new User();
```

---

# 10. static / final

## static

```java
public static void main(String[] args)
```

特徴：

- インスタンス生成不要
- 共通処理向き

---

## final

```java
final int MAX = 100;
```

変更不可。

---

# 11. 例外処理

## try-catch

```java
try {
    int result = 10 / 0;
} catch (Exception e) {
    e.printStackTrace();
}
```

---

## throws

```java
public void execute() throws Exception {
}
```

---

# 12. コレクション

## List

```java
List<String> list = new ArrayList<>();
list.add("A");
```

ループ：

```java
for (String item : list) {
}
```

---

## Map

```java
Map<String, String> map = new HashMap<>();
map.put("A", "001");
```

取得：

```java
map.get("A");
```

---

# 13. ファイル操作

```java
BufferedReader br = new BufferedReader(
    new FileReader("sample.txt")
);
```

実務：

```java
try-with-resources
```

推奨。

---

# 14. ログ出力

```java
logger.info("開始");
logger.error("異常", e);
```

実務：

- System.out.println禁止
- logger使用

---

# 15. 実務サンプル

## NULLチェック

```java
if (Objects.nonNull(user)) {
}
```

---

## DB検索結果0件

```java
if (list.isEmpty()) {
}
```

---

## 定数クラス

```java
public final class Constants {

    private Constants() {
    }

    public static final String STATUS_OK = "0";
}
```

---

# 16. コーディング注意点

- NullPointerException対策
- 定数化徹底
- マジックナンバー禁止
- logger使用
- catch握り潰し禁止
- close漏れ禁止
- 早期returnを適切利用
- メソッド肥大化禁止

推奨：

- 1メソッド50行程度
- ネスト3段以内
- 単体テストしやすい設計

---

# 改訂履歴

|版数|日付|内容|作成者|
|---|---|---|---|
|1.0|2026-05-24|初版作成|ChatGPT|

