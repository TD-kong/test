# Oracle SQL 予約語・構文リファレンス（実務向け）

> 本資料は「テンプレート例文集」ではなく、**Oracle SQLで実務上よく使う予約語・句の意味と使いどころ**を重視したリファレンスです。  
> 対象は Oracle Database（主に 12c 以降）を想定しています。

---

## 1. SELECT（取得の起点）

- **役割**: 問い合わせ結果として返す列・式を定義する。
- **実務ポイント**:
  - `SELECT *` は保守性が下がるため、基本は列名を明示。
  - `AS` で別名を付けると、BIや後続SQLで可読性が上がる。

```sql
SELECT emp_id AS employee_id, emp_name, salary
FROM employees;
```

---

## 2. FROM（参照元の指定）

- **役割**: 取得対象テーブル、ビュー、サブクエリを指定する。
- **実務ポイント**:
  - 複数表を扱う時は別名（`e`, `d` など）を統一ルールで付与。
  - サブクエリには必ず別名を付ける。

```sql
SELECT e.emp_name
FROM employees e;
```

---

## 3. WHERE（行フィルタ）

- **役割**: 行レベルの絞り込み条件。
- **実務ポイント**:
  - `NULL` 比較は `= NULL` ではなく `IS NULL` / `IS NOT NULL`。
  - 日付境界は `>= :start_dt AND < :end_dt` を推奨（取りこぼし防止）。

```sql
SELECT order_id, order_date
FROM orders
WHERE order_date >= :start_dt
  AND order_date <  :end_dt;
```

---

## 4. DISTINCT（重複排除）

- **役割**: 結果セットの重複行を除去。
- **実務ポイント**:
  - 安易な `DISTINCT` は集計ミスの隠蔽につながる。
  - 重複原因（JOIN条件不足など）を先に疑う。

```sql
SELECT DISTINCT department_id
FROM employees;
```

---

## 5. JOIN / ON（表結合）

- **役割**: 複数テーブルを結合し、関連データを横持ちにする。
- **主要種別**:
  - `INNER JOIN`: 両方に一致がある行のみ
  - `LEFT JOIN`: 左表を全件保持
  - `RIGHT JOIN`: 右表を全件保持
  - `FULL OUTER JOIN`: 両表全件保持
- **実務ポイント**:
  - `ON` に結合キー、`WHERE` に絞り込み条件を分離すると事故が減る。

```sql
SELECT e.emp_name, d.dept_name
FROM employees e
INNER JOIN departments d
  ON e.dept_id = d.dept_id;
```

---

## 6. GROUP BY（集約単位）

- **役割**: 集計の粒度（単位）を決める。
- **実務ポイント**:
  - `SELECT` に非集計列を置く場合、必ず `GROUP BY` に含める。
  - 粒度をコメントで明示するとレビューが通しやすい。

```sql
SELECT dept_id, COUNT(*) AS headcount
FROM employees
GROUP BY dept_id;
```

---

## 7. HAVING（集約後フィルタ）

- **役割**: `GROUP BY` 後の集計結果に条件をかける。
- **実務ポイント**:
  - 明細条件は `WHERE`、集計条件は `HAVING`。

```sql
SELECT dept_id, COUNT(*) AS headcount
FROM employees
GROUP BY dept_id
HAVING COUNT(*) >= 10;
```

---

## 8. ORDER BY（並び順）

- **役割**: 結果の表示順を定義。
- **実務ポイント**:
  - `ASC`（昇順）/`DESC`（降順）を明示。
  - 同率時の第2キーを置くと出力が安定。

```sql
SELECT emp_id, emp_name, hire_date
FROM employees
ORDER BY hire_date DESC, emp_id ASC;
```

---

## 9. FETCH FIRST / OFFSET（ページング）

- **役割**: Oracle 12c以降の行数制限・オフセット。
- **実務ポイント**:
  - `ORDER BY` とセットで使わないと、結果順が不安定。

```sql
SELECT emp_id, emp_name
FROM employees
ORDER BY emp_id
OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY;
```

---

## 10. WITH（共通表式 / CTE）

- **役割**: 中間結果を名前付きで定義し、SQLを段階化。
- **実務ポイント**:
  - 複雑なロジックはCTEで分解すると保守が容易。

```sql
WITH recent_orders AS (
  SELECT order_id, customer_id
  FROM orders
  WHERE order_date >= TRUNC(SYSDATE) - 30
)
SELECT customer_id, COUNT(*) AS cnt
FROM recent_orders
GROUP BY customer_id;
```

---

## 11. CASE（条件分岐）

- **役割**: 条件に応じた値変換を行う。
- **実務ポイント**:
  - 集計前処理（区分化）で特に有効。

```sql
SELECT emp_id,
       CASE
         WHEN salary >= 1000000 THEN 'HIGH'
         WHEN salary >= 500000  THEN 'MID'
         ELSE 'LOW'
       END AS salary_band
FROM employees;
```

---

## 12. EXISTS / NOT EXISTS（存在判定）

- **役割**: 関連行の有無でフィルタ。
- **実務ポイント**:
  - `IN` より意図が明確になる場面が多い（特に相関条件）。

```sql
SELECT c.customer_id
FROM customers c
WHERE EXISTS (
  SELECT 1
  FROM orders o
  WHERE o.customer_id = c.customer_id
);
```

---

## 13. MERGE（Oracle流UPSERT）

- **役割**: 一致時UPDATE・不一致時INSERT を1文で処理。
- **実務ポイント**:
  - バッチ取込やマスタ同期で定番。
  - `ON` 条件は主キー/一意キーに寄せる。

```sql
MERGE INTO dim_customer d
USING staging_customer s
   ON (d.customer_id = s.customer_id)
WHEN MATCHED THEN
  UPDATE SET d.customer_name = s.customer_name,
             d.updated_at    = SYSTIMESTAMP
WHEN NOT MATCHED THEN
  INSERT (customer_id, customer_name, updated_at)
  VALUES (s.customer_id, s.customer_name, SYSTIMESTAMP);
```

---

## 14. INSERT / UPDATE / DELETE（DML基本）

- **INSERT**: 新規行追加
- **UPDATE**: 既存行更新
- **DELETE**: 行削除
- **実務ポイント**:
  - 本番系は `WHERE` 対象件数を必ず事前確認。
  - 大量更新はトランザクション設計（コミット単位）を明確化。

```sql
UPDATE orders
SET status = 'SHIPPED'
WHERE shipped_at IS NOT NULL
  AND status <> 'SHIPPED';
```

---

## 15. COMMIT / ROLLBACK / SAVEPOINT（トランザクション制御）

- **COMMIT**: 変更確定
- **ROLLBACK**: 未確定変更を取り消し
- **SAVEPOINT**: ロールバックの中間地点
- **実務ポイント**:
  - DML作業前に `SAVEPOINT` を置くと復旧が早い。

```sql
SAVEPOINT before_mass_update;
UPDATE employees SET bonus = bonus * 1.05 WHERE dept_id = 10;
ROLLBACK TO before_mass_update;
```

---

## 16. CREATE / ALTER / DROP / TRUNCATE（DDL）

- **CREATE**: オブジェクト作成
- **ALTER**: オブジェクト変更
- **DROP**: オブジェクト削除
- **TRUNCATE**: 全件高速削除（DDL扱い）
- **実務ポイント**:
  - OracleではDDL実行時に暗黙コミットが発生するため注意。

```sql
ALTER TABLE employees ADD (nickname VARCHAR2(100));
```

---

## 17. GRANT / REVOKE（権限管理）

- **GRANT**: 権限付与
- **REVOKE**: 権限剥奪
- **実務ポイント**:
  - 付与は最小権限原則で。
  - ロール経由付与を優先すると運用しやすい。

```sql
GRANT SELECT ON hr.employees TO analyst_role;
```

---

## 18. NULL関連（IS NULL / NVL / COALESCE）

- **IS NULL / IS NOT NULL**: NULL判定
- **NVL(expr1, expr2)**: `expr1` がNULLなら `expr2`
- **COALESCE(...)**: 先頭からNULLでない値
- **実務ポイント**:
  - 表示・集計でNULLをどう扱うかを要件で固定化する。

```sql
SELECT emp_id,
       NVL(commission_pct, 0) AS commission_pct
FROM employees
WHERE manager_id IS NOT NULL;
```

---

## 19. 日付・時刻の代表語（SYSDATE / SYSTIMESTAMP / TRUNC）

- **SYSDATE**: DBサーバ日時（日付型）
- **SYSTIMESTAMP**: タイムゾーン含む高精度時刻
- **TRUNC(date)**: 日時の丸め（例: 日単位）
- **実務ポイント**:
  - 日次集計の比較は `TRUNC` を使い境界を揃える。

```sql
SELECT TRUNC(SYSDATE) AS today,
       SYSTIMESTAMP   AS now_ts
FROM dual;
```

---

## 20. データ型とOracle固有語（VARCHAR2 / NUMBER / DATE / TIMESTAMP）

- **VARCHAR2(n)**: 可変長文字列
- **NUMBER(p, s)**: 精度・スケール指定可能な数値
- **DATE**: 日付＋時分秒
- **TIMESTAMP**: DATEより高精度
- **実務ポイント**:
  - 桁数・精度の不足は後工程障害に直結するため、初期設計で厳密化。

```sql
CREATE TABLE sample_txn (
  txn_id        NUMBER(18, 0),
  customer_name VARCHAR2(200),
  amount        NUMBER(12, 2),
  created_at    TIMESTAMP
);
```

---

## 実務運用チェックリスト（Oracle向け）

- DML前に対象件数確認（`SELECT COUNT(*) ...`）。
- 本番変更はトランザクション境界（`COMMIT` タイミング）を事前合意。
- DDLは暗黙コミットを伴う前提で変更計画を立てる。
- `ORDER BY` なしのページング禁止。
- `NULL` の業務意味（未設定/不明/該当なし）を定義してから `NVL` を使う。

