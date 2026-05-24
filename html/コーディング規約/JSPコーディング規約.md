# JSP コーディング規約（実務向け）

## 目次

- [1. はじめに](#1-はじめに)
- [2. 基本方針](#2-基本方針)
- [3. JSP設計原則](#3-jsp設計原則)
- [4. 命名規約](#4-命名規約)
- [5. HTML / JSP記述規約](#5-html--jsp記述規約)
- [6. Scriptlet禁止規約](#6-scriptlet禁止規約)
- [7. EL / JSTL利用規約](#7-el--jstl利用規約)
- [8. URL・画面遷移規約](#8-url画面遷移規約)
- [9. セッション規約](#9-セッション規約)
- [10. 入力チェック規約](#10-入力チェック規約)
- [11. エラーメッセージ規約](#11-エラーメッセージ規約)
- [12. セキュリティ規約](#12-セキュリティ規約)
- [13. コメント規約](#13-コメント規約)
- [14. パフォーマンス規約](#14-パフォーマンス規約)
- [15. 禁止事項](#15-禁止事項)
- [16. レビュー観点](#16-レビュー観点)
- [17. 実務TIPS](#17-実務tips)

---

# 1. はじめに

本規約は、JSPの可読性・保守性・セキュリティを向上させることを目的とする。

対象：

- JSP画面
- 入力フォーム
- 一覧画面
- 確認画面
- エラー画面

想定：

```text
Struts
Spring MVC
レガシーJSP
Liberty / WAS
```

---

# 2. 基本方針

## 1. JSPに業務ロジックを書かない

JSPは**表示専用**。

NG：

```jsp
<%
if (user.getAge() >= 20) {
    out.print("成人");
}
%>
```

OK：

Controller側：

```java
request.setAttribute(
    "isAdult",
    true
);
```

JSP側：

```jsp
<c:if test="${isAdult}">
    成人
</c:if>
```

---

## 2. Scriptlet禁止

原則禁止。

禁止：

```jsp
<%
%>
```

理由：

- 可読性低下
- テスト不可
- 保守困難

---

## 3. JSPは表示だけ

責務分離。

| 処理 | 場所 |
|---|---|
| 業務ロジック | Java |
| DBアクセス | DAO |
| バリデーション | Controller |
| 表示 | JSP |

---

# 3. JSP設計原則

## MVCを守る

### Model

```text
Java
Service
DAO
```

### View

```text
JSP
```

### Controller

```text
Servlet
Action
Spring Controller
```

---

## 共通部品化

ヘッダ：

```jsp
<jsp:include page="/common/header.jsp"/>
```

フッタ：

```jsp
<jsp:include page="/common/footer.jsp"/>
```

---

## 重複HTML禁止

共通化。

---

# 4. 命名規約

## JSP名

### lower_snake_case.jsp

OK：

```text
user_list.jsp
user_detail.jsp
order_confirm.jsp
```

NG：

```text
UserList.jsp
test.jsp
aaa.jsp
```

---

## id属性

意味が分かる名前。

OK：

```html
id="userName"
```

NG：

```html
id="txt1"
```

---

## name属性

DTO/Beanと合わせる。

OK：

```html
name="userName"
```

---

# 5. HTML / JSP記述規約

## インデント

スペース4。

OK：

```jsp
<div>
    <table>
        <tr>
```

---

## タグ閉じ忘れ禁止

NG：

```html
<td>
```

OK：

```html
<td></td>
```

---

## 属性改行

長い場合。

OK：

```html
<input
    type="text"
    id="userName"
    name="userName"
    maxlength="20">
```

---

## CSS直書き禁止

NG：

```html
<div style="color:red">
```

OK：

```html
<div class="error">
```

---

# 6. Scriptlet禁止規約

## NG

```jsp
<%
String name =
request.getParameter("name");
%>
```

---

## OK

EL利用：

```jsp
${userName}
```

---

## Beanアクセス

NG：

```jsp
<%= user.getName() %>
```

OK：

```jsp
${user.name}
```

---

# 7. EL / JSTL利用規約

## JSTL使用

推奨：

```jsp
<c:if>
<c:forEach>
<c:choose>
```

---

## if

OK：

```jsp
<c:if test="${isError}">
    エラー
</c:if>
```

---

## forEach

OK：

```jsp
<c:forEach
    items="${userList}"
    var="user">

    ${user.name}

</c:forEach>
```

---

## choose

OK：

```jsp
<c:choose>
    <c:when test="${status == '1'}">
        正常
    </c:when>

    <c:otherwise>
        異常
    </c:otherwise>
</c:choose>
```

---

# 8. URL・画面遷移規約

## クエリパラメータ直編集禁止

NG：

```text
userDetail.jsp?id=1
```

理由：

- 改ざん可能
- セキュリティリスク

---

## POST優先

更新系：

```text
POST
```

取得系：

```text
GET
```

---

## URL直書き禁止

NG：

```jsp
href="/test/user"
```

OK：

```jsp
<c:url value="/user"/>
```

---

## ContextPath利用

OK：

```jsp
${pageContext.request.contextPath}
```

---

# 9. セッション規約

## セッション乱用禁止

必要最低限。

NG：

```java
session.setAttribute(
    "allUserList",
    list
);
```

---

## 大容量格納禁止

メモリ圧迫。

---

## Timeout考慮

ログイン画面戻し。

---

# 10. 入力チェック規約

## 必須チェック

Controller側。

---

## Lengthチェック

例：

```text
20文字以内
```

---

## XSSチェック

出力時：

```jsp
<c:out value="${userName}" />
```

推奨。

---

## JavaScript依存禁止

サーバ側必須。

---

# 11. エラーメッセージ規約

## 固定文言禁止

定数化。

NG：

```jsp
入力エラー
```

---

## メッセージID管理

推奨：

```text
MSG0001
```

---

## 吹き出し例

OK：

```text
入力値に誤りがあります。
```

---

# 12. セキュリティ規約

## XSS対策

必須。

NG：

```jsp
${comment}
```

OK：

```jsp
<c:out value="${comment}" />
```

---

## CSRF対策

Token使用。

---

## Hidden信用禁止

NG：

```html
<input
    type="hidden"
    name="role"
    value="admin">
```

---

## SQL直接禁止

JSPからDBアクセス禁止。

---

# 13. コメント規約

## 理由を書く

NG：

```jsp
<!-- if -->
```

OK：

```jsp
<!-- エラー時表示 -->
```

---

## コメント30%ルール（現場依存）

---

# 14. パフォーマンス規約

## 重い処理禁止

NG：

```jsp
DBアクセス
```

---

## forネスト注意

大量件数。

---

## Session肥大化禁止

---

# 15. 禁止事項

- Scriptlet
- Javaコード埋込
- SQL直書き
- CSS直書き
- JavaScriptのみ検証
- URLパラメータ改ざん依存
- セッション乱用
- Hidden信用

---

# 16. レビュー観点

- Scriptletないか
- EL/JSTL使用か
- URL安全か
- XSS対策あるか
- c:out使用か
- session乱用ないか
- コメント適切か
- 共通化できるか

---

# 17. 実務TIPS

## レガシーJSPあるある

普通に：

```jsp
<%
%>
```

だらけ。

---

## Liberty / WAS現場

ContextRoot確認。

例：

```text
ibm-web-ext.xml
```

---

## URL変更禁止案件

相対パス修正で逃げる。

---

## エラーフラグ

よくある：

```jsp
${isError}
```

---

## 実務頻出タグ

```jsp
<c:if>
<c:forEach>
<c:out>
<c:url>
<fmt:formatDate>
```

重点学習推奨。
