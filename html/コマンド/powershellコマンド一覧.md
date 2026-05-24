# PowerShell コマンド一覧（実務向け）

## 目次
- [1. 概要](#1-概要)
- [2. 基本コマンド](#2-基本コマンド)
- [3. ファイル・フォルダ操作](#3-ファイルフォルダ操作)
- [4. テキスト操作](#4-テキスト操作)
- [5. プロセス操作](#5-プロセス操作)
- [6. サービス操作](#6-サービス操作)
- [7. ネットワーク操作](#7-ネットワーク操作)
- [8. ログ・イベント確認](#8-ログイベント確認)
- [9. システム情報取得](#9-システム情報取得)
- [10. 実務でよく使う例](#10-実務でよく使う例)

---

# 1. 概要

PowerShellは、Windows標準のコマンドラインおよびスクリプト実行環境であり、運用自動化、ログ取得、サーバ管理などで利用される。

特徴：

- オブジェクト指向
- Windows管理に強い
- バッチより高機能
- Excel/VBAとの相性が良い

---

# 2. 基本コマンド

## 現在ディレクトリ表示

```powershell
Get-Location
```

省略形：

```powershell
pwd
```

---

## ディレクトリ移動

```powershell
Set-Location C:\work
```

省略形：

```powershell
cd C:\work
```

---

## ファイル一覧表示

```powershell
Get-ChildItem
```

省略形：

```powershell
dir
ls
```

---

# 3. ファイル・フォルダ操作

## ファイルコピー

```powershell
Copy-Item source.txt backup.txt
```

フォルダコピー：

```powershell
Copy-Item C:\src C:\backup -Recurse
```

---

## ファイル移動

```powershell
Move-Item file.txt archive\
```

---

## ファイル削除

```powershell
Remove-Item file.txt
```

フォルダ削除：

```powershell
Remove-Item folder -Recurse -Force
```

注意：

- `-Force` は慎重に使用

---

## フォルダ作成

```powershell
New-Item folder1 -ItemType Directory
```

---

## ファイル作成

```powershell
New-Item sample.txt -ItemType File
```

---

# 4. テキスト操作

## ファイル内容表示

```powershell
Get-Content log.txt
```

tail相当：

```powershell
Get-Content log.txt -Tail 100
```

リアルタイム監視：

```powershell
Get-Content log.txt -Wait
```

---

## 文字列検索

```powershell
Select-String "ERROR" *.log
```

grep相当。

---

## 文字列置換

```powershell
(Get-Content sample.txt) -replace 'A','B'
```

---

# 5. プロセス操作

## プロセス一覧

```powershell
Get-Process
```

特定プロセス確認：

```powershell
Get-Process chrome
```

---

## プロセス停止

```powershell
Stop-Process -Name chrome
```

PID指定：

```powershell
Stop-Process -Id 1234
```

---

## プロセス起動

```powershell
Start-Process notepad
```

---

# 6. サービス操作

## サービス一覧

```powershell
Get-Service
```

特定サービス確認：

```powershell
Get-Service Spooler
```

---

## サービス開始

```powershell
Start-Service Spooler
```

---

## サービス停止

```powershell
Stop-Service Spooler
```

---

## サービス再起動

```powershell
Restart-Service Spooler
```

---

# 7. ネットワーク操作

## 疎通確認

```powershell
Test-Connection google.com
```

ping相当。

---

## ポート確認

```powershell
Test-NetConnection localhost -Port 8080
```

---

## IP確認

```powershell
ipconfig
```

PowerShell版：

```powershell
Get-NetIPAddress
```

---

# 8. ログ・イベント確認

## イベントログ確認

```powershell
Get-EventLog -LogName System
```

最新100件：

```powershell
Get-EventLog -LogName Application -Newest 100
```

---

## エラーログ検索

```powershell
Get-EventLog -LogName System | Where-Object {$_.EntryType -eq 'Error'}
```

---

# 9. システム情報取得

## OS情報

```powershell
Get-ComputerInfo
```

---

## ディスク容量

```powershell
Get-PSDrive
```

---

## メモリ確認

```powershell
Get-CimInstance Win32_OperatingSystem
```

---

# 10. 実務でよく使う例

## ログ監視

```powershell
Get-Content app.log -Wait
```

---

## 特定文字列の件数確認

```powershell
(Select-String "ERROR" *.log).Count
```

---

## CSV読み込み

```powershell
Import-Csv sample.csv
```

---

## Excelマクロから実行

```vba
Shell "powershell.exe -ExecutionPolicy Bypass -File C:\work\sample.ps1", vbNormalFocus
```

---

# 改訂履歴

|版数|日付|内容|作成者|
|---|---|---|---|
|1.0|2026-05-24|初版作成|ChatGPT|

