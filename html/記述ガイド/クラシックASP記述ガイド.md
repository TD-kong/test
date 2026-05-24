# クラシックASP（Classic ASP）記述方法ガイド

## 目次
- [1. 概要](#1-概要)
- [2. 基本構文](#2-基本構文)
- [3. 変数・定数](#3-変数定数)
- [4. 条件分岐](#4-条件分岐)
- [5. 繰り返し処理](#5-繰り返し処理)
- [6. 配列](#6-配列)
- [7. 関数・Sub](#7-関数sub)
- [8. オブジェクト](#8-オブジェクト)
- [9. Request/Response](#9-requestresponse)
- [10. Session/Application](#10-sessionapplication)
- [11. DB接続（ADO）](#11-db接続ado)
- [12. SQL実行例](#12-sql実行例)
- [13. エラーハンドリング](#13-エラーハンドリング)
- [14. 実務サンプル](#14-実務サンプル)
- [15. コーディング注意点](#15-コーディング注意点)

---

# 1. 概要

クラシックASP（Classic ASP）は、Microsoftが提供していたサーバサイド技術であり、主にVBScriptを使用して動的Webページを生成する。

拡張子：

```text
.asp
```

特徴：

- HTMLにVBScriptを埋め込む
- IIS上で動作
- Session管理可能
- ADOによるDB接続

ASP.NETとは別物。

---

# 2. 基本構文

## ASPタグ

```asp
<%
Response.Write "Hello ASP"
%>
```

HTML埋め込み例：

```asp
<html>
<body>
<%
Response.Write "Hello"
%>
</body>
</html>
```

ショート出力：

```asp
<%= userName %>
```

---

# 3. 変数・定数

## 変数

```asp
Dim userName
userName = "Tanaka"
```

複数宣言：

```asp
Dim a, b, c
```

---

## 定数

```asp
Const MAX_COUNT = 100
```

---

# 4. 条件分岐

## If

```asp
If age >= 20 Then
    Response.Write "成人"
End If
```

---

## If Else

```asp
If score >= 80 Then
    grade = "A"
Else
    grade = "B"
End If
```

---

## Select Case

```asp
Select Case status
    Case "0"
        msg = "正常"
    Case "1"
        msg = "異常"
    Case Else
        msg = "不明"
End Select
```

---

# 5. 繰り返し処理

## For

```asp
Dim i

For i = 1 To 10
    Response.Write i
Next
```

---

## Do While

```asp
Do While cnt < 10
    cnt = cnt + 1
Loop
```

---

## For Each

```asp
For Each item In Request.Form
    Response.Write item
Next
```

---

# 6. 配列

## 配列宣言

```asp
Dim arr(5)
```

値設定：

```asp
arr(0) = "A"
```

---

## 動的配列

```asp
ReDim arr(10)
```

保持：

```asp
ReDim Preserve arr(20)
```

---

# 7. 関数・Sub

## Function

```asp
Function Add(a, b)
    Add = a + b
End Function
```

呼び出し：

```asp
result = Add(10, 20)
```

---

## Sub

```asp
Sub ShowMessage(msg)
    Response.Write msg
End Sub
```

呼び出し：

```asp
Call ShowMessage("test")
```

---

# 8. オブジェクト

## オブジェクト生成

```asp
Set obj = Server.CreateObject("Scripting.FileSystemObject")
```

解放：

```asp
Set obj = Nothing
```

---

# 9. Request/Response

## GET取得

```asp
id = Request.QueryString("id")
```

URL例：

```text
sample.asp?id=100
```

---

## POST取得

```asp
name = Request.Form("name")
```

---

## 出力

```asp
Response.Write "Hello"
```

リダイレクト：

```asp
Response.Redirect "menu.asp"
```

---

# 10. Session/Application

## Session保存

```asp
Session("USER_ID") = "A001"
```

取得：

```asp
userId = Session("USER_ID")
```

削除：

```asp
Session.Abandon
```

---

## Application

```asp
Application("COUNT") = 1
```

全体共有データ。

---

# 11. DB接続（ADO）

## Connection生成

```asp
Set conn = Server.CreateObject("ADODB.Connection")
```

接続：

```asp
conn.Open connectionString
```

切断：

```asp
conn.Close
Set conn = Nothing
```

---

# 12. SQL実行例

## SELECT

```asp
sql = "SELECT * FROM EMPLOYEE"

Set rs = conn.Execute(sql)

Do Until rs.EOF
    Response.Write rs("EMP_NAME")
    rs.MoveNext
Loop
```

---

## INSERT

```asp
sql = "INSERT INTO TEST VALUES('A')"
conn.Execute sql
```

---

# 13. エラーハンドリング

## On Error Resume Next

```asp
On Error Resume Next

conn.Open connectionString

If Err.Number <> 0 Then
    Response.Write Err.Description
End If
```

解除：

```asp
On Error Goto 0
```

---

# 14. 実務サンプル

## ログインID取得

```asp
loginId = Request.Form("LOGIN_ID")
```

---

## DB検索→一覧表示

```asp
sql = "SELECT * FROM USER_MST"
Set rs = conn.Execute(sql)

Do Until rs.EOF
%>
<tr>
<td><%= rs("USER_ID") %></td>
<td><%= rs("USER_NAME") %></td>
</tr>
<%
rs.MoveNext
Loop
```

---

# 15. コーディング注意点

- `Option Explicit` を使用する
- SQLインジェクション対策を行う
- Session肥大化に注意
- DB接続close漏れ禁止
- `Set Nothing` を徹底
- HTMLとVBScriptを分離意識する
- Request値のNULLチェック必須

推奨：

```asp
<%
Option Explicit
%>
```

---

# 改訂履歴

|版数|日付|内容|作成者|
|---|---|---|---|
|1.0|2026-05-24|初版作成|ChatGPT|

