# Java基礎研修（第2版）

> 第1版の続き
>
> 本章では、**「メソッド」「クラス」「new」「コンストラクタ」** を理解し、実務コードが読める入口を目指します。

# 目次

- [1. メソッドとは](#1-メソッドとは)
- [2. 引数](#2-引数)
- [3. 戻り値](#3-戻り値)
- [4. voidとは](#4-voidとは)
- [5. staticとは](#5-staticとは)
- [6. クラスとは](#6-クラスとは)
- [7. newとは](#7-newとは)
- [8. コンストラクタ](#8-コンストラクタ)
- [9. getter / setter](#9-getter--setter)
- [10. カプセル化](#10-カプセル化)
- [11. 演習問題](#11-演習問題)

---

# 1. メソッドとは

メソッドは

> 処理をまとめた部品

です。

同じ処理を何度も書かないために使います。

## 例

```java
public class Main {

    public static void main(String[] args) {
        hello();
    }

    public static void hello() {
        System.out.println("こんにちは");
    }
}
```

実行結果

```text
こんにちは
```

---

# 2. 引数

引数とは

> メソッドに渡す値

です。

```java
public class Main {

    public static void main(String[] args) {
        hello("田中");
    }

    public static void hello(String name) {
        System.out.println(name + "さん");
    }
}
```

結果

```text
田中さん
```

## イメージ

```text
main
 ↓
hello("田中")
 ↓
name箱へ入る
```

---

# 3. 戻り値

処理結果を返す。

```java
public static int add(int a, int b) {
    return a + b;
}
```

使用例

```java
int result = add(10, 20);
System.out.println(result);
```

結果

```text
30
```

## return

> メソッドから値を返す

---

# 4. voidとは

戻り値なし。

```java
public static void hello() {
    System.out.println("Hello");
}
```

### intとの違い

```java
public static int add()
```

→ 値を返す

```java
public static void hello()
```

→ 返さない

---

# 5. staticとは

newしなくても使える。

```java
Math.max(10, 20)
```

は static。

### staticなし

```java
Dog dog = new Dog();
dog.bark();
```

### staticあり

```java
Dog.bark();
```

ただし実務では乱用しない。

---

# 6. クラスとは

設計図。

```java
public class Employee {

    String name;
    int age;

}
```

### イメージ

```text
設計図
 ↓
実体化(new)
 ↓
オブジェクト
```

---

# 7. newとは

実体を作る。

```java
Employee emp = new Employee();
```

### イメージ

```text
Employee設計図
       ↓
new
       ↓
実物生成
```

値設定

```java
emp.name = "田中";
emp.age = 20;
```

表示

```java
System.out.println(emp.name);
```

---

# 8. コンストラクタ

作成時に初期化する。

```java
public class Employee {

    String name;

    public Employee(String name) {
        this.name = name;
    }
}
```

使用

```java
Employee emp = new Employee("田中");
```

## thisとは

> 自分自身

```java
this.name
```

左：フィールド

右：引数

新人が最初に混乱しやすいポイント。

---

# 9. getter / setter

値取得と設定。

```java
private String name;

public String getName() {
    return name;
}

public void setName(String name) {
    this.name = name;
}
```

---

# 10. カプセル化

直接触らせない。

NG

```java
emp.age = -999;
```

OK

```java
setAge()
```

でチェック。

### 実務理由

不正データ防止。

---

# 11. 演習問題

## 問題1

名前を受け取って表示するメソッドを作る。

---

## 問題2

2つのintを足してreturnする。

---

## 問題3

Personクラスを作る。

項目

- 名前
- 年齢

---

## 問題4

コンストラクタで初期化する。

---

# 実務ポイント

業務コードの多くは

```text
main
 ↓
Service
 ↓
DAO
 ↓
DB
```

のようにメソッド呼び出しの連続です。

そのため

> 引数
> 戻り値
> new
> クラス

が理解できると急に読めるようになります。

