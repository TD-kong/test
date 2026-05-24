# Oracle PL/SQL 実務リファレンス（予約語・構文中心）

> 本資料は、PL/SQLを**テンプレート集として羅列するのではなく**、実務で頻出する予約語・構文の意味と使いどころを簡潔に整理したものです。  
> 対象は Oracle Database（主に 12c 以降）を想定しています。

---

## 1. DECLARE / BEGIN / END（基本ブロック）

- **役割**:
  - `DECLARE`: 変数・定数・カーソル・例外を宣言
  - `BEGIN`: 実行部
  - `END`: ブロック終端
- **実務ポイント**:
  - 小さな処理でもブロック境界を明示すると保守しやすい。

```sql
DECLARE
  v_count NUMBER := 0;
BEGIN
  SELECT COUNT(*) INTO v_count FROM employees;
  DBMS_OUTPUT.PUT_LINE('count=' || v_count);
END;
/
```

---

## 2. 変数宣言（%TYPE / %ROWTYPE）

- **役割**:
  - `%TYPE`: 列と同じ型の変数を宣言
  - `%ROWTYPE`: 行全体と同じレコード型を宣言
- **実務ポイント**:
  - テーブル定義変更の追従を容易にするため、可能な限り `%TYPE` を優先。

```sql
DECLARE
  v_emp_name employees.emp_name%TYPE;
  r_emp      employees%ROWTYPE;
BEGIN
  NULL;
END;
/
```

---

## 3. SELECT ... INTO（単一行取得）

- **役割**: 問い合わせ結果をPL/SQL変数へ代入。
- **注意点**:
  - 0行: `NO_DATA_FOUND`
  - 複数行: `TOO_MANY_ROWS`

```sql
DECLARE
  v_salary employees.salary%TYPE;
BEGIN
  SELECT salary
    INTO v_salary
    FROM employees
   WHERE emp_id = :emp_id;
END;
/
```

---

## 4. IF / ELSIF / ELSE（条件分岐）

- **役割**: 条件に応じた処理分岐。
- **実務ポイント**:
  - 多段条件は `ELSIF` で平坦化し、ネストを深くしない。

```sql
IF v_score >= 90 THEN
  v_rank := 'A';
ELSIF v_score >= 70 THEN
  v_rank := 'B';
ELSE
  v_rank := 'C';
END IF;
```

---

## 5. LOOP / EXIT / WHILE（反復制御）

- **役割**: 繰り返し処理。
- **主な形式**:
  - `LOOP ... EXIT WHEN ... END LOOP;`
  - `WHILE ... LOOP ... END LOOP;`
  - `FOR i IN 1..n LOOP ... END LOOP;`
- **実務ポイント**:
  - 無限ループ防止のため `EXIT WHEN` 条件を明示。

```sql
v_i := 1;
LOOP
  EXIT WHEN v_i > 10;
  v_i := v_i + 1;
END LOOP;
```

---

## 6. FOR LOOP（範囲・カーソル反復）

- **役割**:
  - 数値範囲ループ
  - カーソル結果の行ループ
- **実務ポイント**:
  - カーソルFORループはOPEN/FETCH/CLOSEを暗黙処理できる。

```sql
FOR r IN (
  SELECT emp_id, emp_name
    FROM employees
   WHERE dept_id = :dept_id
) LOOP
  DBMS_OUTPUT.PUT_LINE(r.emp_id || ':' || r.emp_name);
END LOOP;
```

---

## 7. CURSOR（明示カーソル）

- **役割**: 複数行結果を段階的に処理。
- **関連語**: `OPEN`, `FETCH`, `CLOSE`
- **実務ポイント**:
  - 行単位処理が本当に必要かを確認（可能ならSQL一発更新を優先）。

```sql
DECLARE
  CURSOR c_emp IS
    SELECT emp_id FROM employees WHERE status = 'ACTIVE';
  v_emp_id employees.emp_id%TYPE;
BEGIN
  OPEN c_emp;
  LOOP
    FETCH c_emp INTO v_emp_id;
    EXIT WHEN c_emp%NOTFOUND;
    NULL;
  END LOOP;
  CLOSE c_emp;
END;
/
```

---

## 8. 例外処理（EXCEPTION / WHEN）

- **役割**: 例外発生時のハンドリング。
- **代表例外**:
  - `NO_DATA_FOUND`
  - `TOO_MANY_ROWS`
  - `ZERO_DIVIDE`
  - `OTHERS`
- **実務ポイント**:
  - `WHEN OTHERS` で握りつぶさず、ログ出力・再送出方針を決める。

```sql
BEGIN
  SELECT salary INTO v_salary FROM employees WHERE emp_id = :emp_id;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    DBMS_OUTPUT.PUT_LINE('not found');
  WHEN TOO_MANY_ROWS THEN
    DBMS_OUTPUT.PUT_LINE('too many rows');
END;
/
```

---

## 9. RAISE / RAISE_APPLICATION_ERROR（例外送出）

- **役割**:
  - `RAISE`: 宣言済み例外を送出
  - `RAISE_APPLICATION_ERROR`: 業務エラーを明示的に返却
- **実務ポイント**:
  - アプリ連携では `-20000`〜`-20999` の業務エラーコード設計を統一。

```sql
IF v_amount < 0 THEN
  RAISE_APPLICATION_ERROR(-20001, 'amount must be non-negative');
END IF;
```

---

## 10. PROCEDURE（手続き）

- **役割**: 値返却を必須としない処理単位。
- **実務ポイント**:
  - 副作用（更新対象テーブル）を仕様コメントに明示。

```sql
CREATE OR REPLACE PROCEDURE proc_close_order (
  p_order_id IN orders.order_id%TYPE
) AS
BEGIN
  UPDATE orders
     SET status = 'CLOSED'
   WHERE order_id = p_order_id;
END;
/
```

---

## 11. FUNCTION（関数）

- **役割**: `RETURN` で値を返す処理単位。
- **実務ポイント**:
  - SQL文中から呼ぶ関数は副作用を避ける。

```sql
CREATE OR REPLACE FUNCTION fn_tax (
  p_amount IN NUMBER
) RETURN NUMBER AS
BEGIN
  RETURN ROUND(p_amount * 0.1, 2);
END;
/
```

---

## 12. IN / OUT / IN OUT（引数モード）

- **IN**: 入力専用
- **OUT**: 出力専用
- **IN OUT**: 入出力
- **実務ポイント**:
  - 基本は `IN` と `OUT` に分離し、`IN OUT` の使用は最小化。

```sql
CREATE OR REPLACE PROCEDURE proc_get_count (
  p_dept_id IN  NUMBER,
  p_count   OUT NUMBER
) AS
BEGIN
  SELECT COUNT(*) INTO p_count FROM employees WHERE dept_id = p_dept_id;
END;
/
```

---

## 13. PACKAGE / PACKAGE BODY

- **役割**:
  - `PACKAGE`: 仕様（公開I/F）
  - `PACKAGE BODY`: 実装
- **実務ポイント**:
  - 公開する手続き/関数と内部専用ロジックを分離できる。

```sql
CREATE OR REPLACE PACKAGE pkg_order AS
  PROCEDURE close_order(p_order_id IN NUMBER);
END pkg_order;
/
```

---

## 14. トランザクション制御（COMMIT / ROLLBACK / SAVEPOINT）

- **役割**: 変更確定・取消・中間復旧点管理。
- **実務ポイント**:
  - どこで `COMMIT` するかを呼び出し側/被呼び出し側で設計統一。
  - PL/SQL内部での自動コミット運用は慎重に。

```sql
SAVEPOINT sp_before;
UPDATE accounts SET balance = balance - 100 WHERE account_id = :from_id;
UPDATE accounts SET balance = balance + 100 WHERE account_id = :to_id;
-- 問題時: ROLLBACK TO sp_before;
```

---

## 15. BULK COLLECT / FORALL（バルク処理）

- **役割**:
  - `BULK COLLECT`: 複数行を配列に一括取得
  - `FORALL`: 配列を使った一括DML
- **実務ポイント**:
  - 行単位ループより高速化しやすい。
  - メモリ使用量を考え、必要なら `LIMIT` 併用。

```sql
DECLARE
  TYPE t_ids IS TABLE OF employees.emp_id%TYPE;
  l_ids t_ids;
BEGIN
  SELECT emp_id BULK COLLECT INTO l_ids
  FROM employees
  WHERE dept_id = :dept_id;

  FORALL i IN 1 .. l_ids.COUNT
    UPDATE employees
       SET processed_flg = 'Y'
     WHERE emp_id = l_ids(i);
END;
/
```

---

## 16. 動的SQL（EXECUTE IMMEDIATE）

- **役割**: 実行時にSQL文字列を組み立てて実行。
- **実務ポイント**:
  - バインド変数を使いSQLインジェクションとハードパースを抑制。

```sql
EXECUTE IMMEDIATE
  'UPDATE employees SET status = :1 WHERE emp_id = :2'
  USING 'ACTIVE', :emp_id;
```

---

## 17. %FOUND / %NOTFOUND / %ROWCOUNT（暗黙カーソル属性）

- **役割**:
  - DML後の影響行数・取得有無を判定。
- **実務ポイント**:
  - 更新件数0件を異常扱いする業務では `%ROWCOUNT` を必ず確認。

```sql
UPDATE orders
   SET status = 'CLOSED'
 WHERE order_id = :order_id;

IF SQL%ROWCOUNT = 0 THEN
  RAISE_APPLICATION_ERROR(-20002, 'target order not found');
END IF;
```

---

## 18. トリガー関連語（CREATE TRIGGER / :NEW / :OLD）

- **役割**: DMLイベント時に自動処理を実行。
- **実務ポイント**:
  - トリガーは副作用が見えにくいため、監査用途など必要最小限に。

```sql
CREATE OR REPLACE TRIGGER trg_orders_bu
BEFORE UPDATE ON orders
FOR EACH ROW
BEGIN
  :NEW.updated_at := SYSTIMESTAMP;
END;
/
```

---

## 19. SYS_REFCURSOR（結果セット返却）

- **役割**: 呼び出し元へ可変結果セットを返す。
- **実務ポイント**:
  - API連携や画面検索の汎用化に有効。

```sql
CREATE OR REPLACE PROCEDURE proc_get_orders (
  p_rc OUT SYS_REFCURSOR
) AS
BEGIN
  OPEN p_rc FOR
    SELECT order_id, order_date, status
      FROM orders
     ORDER BY order_date DESC;
END;
/
```

---

## 20. DBMS_OUTPUT（デバッグ出力）

- **役割**: 実行中の情報を出力。
- **実務ポイント**:
  - 本番運用ログは `DBMS_OUTPUT` 依存にせず、監査テーブル/ロガーを利用。

```sql
DBMS_OUTPUT.PUT_LINE('process start: ' || TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS'));
```

---

## PL/SQL 実務チェックリスト

- 例外処理で `WHEN OTHERS THEN NULL` を禁止（握りつぶし防止）。
- `SELECT ... INTO` は0件/複数件例外を前提に設計。
- ループ内DMLが多い場合は `BULK COLLECT` / `FORALL` を検討。
- 動的SQLは必ずバインド変数を使う。
- コミット責務（呼び出し元か、PL/SQL内か）を設計書に明記。

