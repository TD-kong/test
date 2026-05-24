# JMeter 使い方ガイド

> 作成日: 2026-05-24  
> 対象: Apache JMeter をこれから使う方向け

---

## 目次

- [1. JMeterとは](#1-jmeterとは)
- [2. インストール](#2-インストール)
- [3. 基本操作の流れ](#3-基本操作の流れ)
- [4. テストプラン作成手順](#4-テストプラン作成手順)
- [5. よく使う要素](#5-よく使う要素)
- [6. 実行と結果確認](#6-実行と結果確認)
- [7. コマンド実行（非GUI）](#7-コマンド実行非gui)
- [8. つまずきやすいポイント](#8-つまずきやすいポイント)

---

## 1. JMeterとは

Apache JMeter は、Web API や Web サイトに対して負荷テスト・性能テストを行うためのツールです。

- レスポンスタイム測定
- 同時アクセス時の挙動確認
- エラー率の確認

などに利用します。

---

## 2. インストール

1. Java（JDK）をインストール
2. Apache JMeter を公式サイトからダウンロード
3. zip を展開
4. `bin/jmeter`（Windows は `jmeter.bat`）を起動

---

## 3. 基本操作の流れ

1. **Test Plan** を作成
2. **Thread Group**（ユーザー数、実行回数）を追加
3. **Sampler**（HTTP Request など）を追加
4. **Listener**（結果確認用）を追加
5. 実行して結果を見る

---

## 4. テストプラン作成手順

### 4.1 Thread Group 追加

- Test Plan を右クリック
- `Add` → `Threads (Users)` → `Thread Group`

設定例:

| 項目 | 値の例 | 説明 |
|---|---:|---|
| Number of Threads | 10 | 同時ユーザー数 |
| Ramp-up Period | 10 | 立ち上げ時間（秒） |
| Loop Count | 5 | 繰り返し回数 |

### 4.2 HTTP Request 追加

- Thread Group を右クリック
- `Add` → `Sampler` → `HTTP Request`

設定例:

| 項目 | 値 |
|---|---|
| Protocol | https |
| Server Name | example.com |
| Method | GET |
| Path | /api/health |

### 4.3 Listener 追加

- Thread Group を右クリック
- `Add` → `Listener` → `View Results Tree`
- 併せて `Summary Report` も追加推奨

---

## 5. よく使う要素

- **HTTP Header Manager**: ヘッダー（Authorization, Content-Type など）設定
- **CSV Data Set Config**: テストデータをCSVから読み込み
- **User Defined Variables**: 共通変数定義
- **Response Assertion**: 期待レスポンスの検証
- **Constant Timer**: リクエスト間隔の調整

---

## 6. 実行と結果確認

### 実行

- ツールバーの緑色の再生ボタンで開始
- 停止は四角ボタン

### 見るべき指標

- Average（平均応答時間）
- 90% Line / 95% Line（パーセンタイル）
- Error %（エラー率）
- Throughput（秒あたり処理数）

---

## 7. コマンド実行（非GUI）

負荷試験は非GUI実行が推奨です。

```bash
jmeter -n -t test_plan.jmx -l result.jtl -e -o report
```

- `-n`: 非GUIモード
- `-t`: テストプラン（.jmx）
- `-l`: 実行ログ（.jtl）
- `-e -o`: HTMLレポート出力

---

## 8. つまずきやすいポイント

- GUIモードで大規模負荷をかけない（PCがボトルネックになる）
- Listener を入れすぎると重くなる
- テスト対象のタイムアウト値を事前確認する
- 実運用に近いデータ量・間隔でテストする

---

必要であれば次に、

- ログインAPI（POST）の具体例
- トークン認証付きシナリオ
- CSVでユーザーIDを切り替える実践例

を追記できます。
