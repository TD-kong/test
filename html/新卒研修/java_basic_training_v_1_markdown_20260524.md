# Java基礎研修（第1版）

> 新卒研修向け / Java初心者向け
>
> 本資料では「文法を暗記する」のではなく、**『なぜそう書くのか』を理解すること**を目的とします。

---

# 目次

* [1. Javaとは](#1-javaとは)
* [2. mainメソッドとは](#2-mainメソッドとは)
* [3. 変数とデータ型](#3-変数とデータ型)
* [4. 演算子](#4-演算子)
* [5. if文](#5-if文)
* [6. switch文](#6-switch文)
* [7. for文](#7-for文)
* [8. while文](#8-while文)
* [9. 配列](#9-配列)
* [10. 初級演習問題](#10-初級演習問題)
* [11. よくあるエラー](#11-よくあるエラー)

---

# 1. Javaとは

Javaは**プログラミング言語**です。

業務システム、Webシステム、バッチ処理などで広く利用されています。

特に企業システムでは多く採用されています。

## Javaの特徴

* OSに依存しにくい
* 大規模開発に強い
* 型が厳密
* コンパイルが必要

## Javaの実行イメージ

```text
Javaコード(.java)
       ↓
コンパイル
       ↓
.classファイル
       ↓
JVM(Java Virtual Machine)
       ↓
実行
```

### ポイント

Javaは書いてすぐ動く言語ではありません。

一度**コンパイル**してから実行します。

そのため、文法ミスは実行前に怒られます。

---

# 2. mainメソッドとは

Javaプログラムの入口です。

```java
public class Main {

    public static void main(String[] args) {
        System.out.println("Hello Java");
    }
}
```

## 実行結果

```text
Hello Java
```

## なぜmainが必要か

コンピュータは

> 「どこから処理を始めればよいの？」

が分かりません。

そのため、Javaでは

```java
public static void main(String[] args)
```

から始めるルールがあります。

## 分解して理解する

```java
public
```

→ 外から呼べる

```java
static
```

→ newしなくても使える

```java
void
```

→ 戻り値なし

```java
String[] args
```

→ 起動時引数

新人のうちは

> 「おまじない」

でOKです。

後で意味が分かります。

---

# 3. 変数とデータ型

## 変数とは

データを入れる箱です。

```java
int age = 20;
```

### イメージ

```text
age箱
┌──────┐
│ 20   │
└──────┘
```

---

## int（整数）

```java
int age = 20;
System.out.println(age);
```

実行結果

```text
20
```

---

## double（小数）

```java
double score = 95.5;
```

---

## String（文字列）

```java
String name = "Tanaka";
```

### 注意

文字列は

```java
""
```

が必要。

NG例

```java
String name = Tanaka;
```

### エラー理由

Javaが

> Tanakaって変数？

と勘違いする。

---

## boolean（真偽値）

```java
boolean isLogin = true;
```

true / false のみ。

---

## var（型推論）

```java
var name = "Tanaka";
```

Javaが自動判定。

ただし実務では可読性重視で多用しないケースもある。

---

# 4. 演算子

## 足し算

```java
int a = 10;
int b = 5;

System.out.println(a + b);
```

結果

```text
15
```

## 比較演算子

```java
==
!=
>
<
>=
<=
```

### 注意

```java
=
```

は代入。

```java
==
```

は比較。

新人が非常に間違えるポイント。

---

# 5. if文

条件分岐。

```java
int score = 80;

if (score >= 70) {
    System.out.println("合格");
}
```

結果

```text
合格
```

## else

```java
if (score >= 70) {
    System.out.println("合格");
} else {
    System.out.println("不合格");
}
```

### よくあるミス

```java
if score >= 70
```

→ カッコ忘れ。

Javaは

> 条件式を()で囲って

と言っている。

---

# 6. switch文

分岐が多い時に使う。

```java
int num = 2;

switch (num) {
case 1:
    System.out.println("1です");
    break;
case 2:
    System.out.println("2です");
    break;
default:
    System.out.println("その他");
}
```

---

# 7. for文

繰り返し処理。

```java
for (int i = 0; i < 5; i++) {
    System.out.println(i);
}
```

結果

```text
0
1
2
3
4
```

## 分解

```java
int i = 0
```

開始

```java
i < 5
```

条件

```java
i++
```

1増える

---

# 8. while文

条件を満たす間繰り返す。

```java
int i = 0;

while (i < 5) {
    System.out.println(i);
    i++;
}
```

## 注意

```java
i++;
```

忘れると無限ループ。

---

# 9. 配列

複数データを管理する。

```java
String[] names = {
    "田中",
    "佐藤",
    "鈴木"
};
```

取得

```java
System.out.println(names[0]);
```

結果

```text
田中
```

### 注意

0開始。

```text
0番目
1番目
2番目
```

新人が最初につまずくポイント。

---

# 10. 初級演習問題

## 問題1

名前を表示してください。

期待結果

```text
田中
```

---

## 問題2

10 + 20 を表示。

---

## 問題3

点数70以上で「合格」。

---

## 問題4

for文で1〜10を表示。

---

# 11. よくあるエラー

## セミコロン忘れ

NG

```java
int age = 20
```

Javaの怒り方

> ';' expected

意味

> ;が必要です

---

## 型違い

NG

```java
int age = "20";
```

意味

> 数字の箱に文字を入れないで

---

## {}忘れ

新人あるある。

コードブロックを意識する。

---

# まとめ

Javaで最初に重要なのは

1. 型
2. if
3. for
4. エラーを読む

です。

エラーは

> コンピュータからのヒント

です。

読めるようになると成長速度が大きく変わります。
