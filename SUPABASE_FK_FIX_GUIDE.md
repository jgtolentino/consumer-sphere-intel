# 🚨 CRITICAL: Fix Supabase PGRST201 Relationship Error

## Problem
```
PGRST201: Could not embed because more than one relationship was found for 'transactions' and 'transaction_items'
```

## Root Cause
**Multiple foreign key relationships** between `transactions` and `transaction_items` tables causing PostgREST embedding ambiguity.

## Immediate Fix Steps

### 1. Open Supabase Dashboard
- Go to your Supabase project
- Navigate to **Table Editor**
- Select `transaction_items` table
- Click **Relationships** tab

### 2. Identify Duplicate Relationships
You'll see multiple entries like:
```
transaction_items.transaction_id -> transactions.id
transaction_items.trans_id -> transactions.id       ← REMOVE THIS
transaction_items.order_id -> transactions.id       ← OR THIS
```

### 3. Keep Only Standard Relationship
**KEEP:** `transaction_items.transaction_id -> transactions.id`  
**REMOVE:** All other FKs pointing to `transactions`

### 4. SQL Diagnostic (Run in SQL Editor)
```sql
-- Run the diagnostic SQL from fix-supabase-relationships.sql
-- This will show all FK relationships
```

### 5. Remove Redundant Constraints
Example (adjust constraint names):
```sql
ALTER TABLE transaction_items 
DROP CONSTRAINT IF EXISTS fk_transaction_items_trans_id;

ALTER TABLE transaction_items 
DROP CONSTRAINT IF EXISTS fk_transaction_items_order_id;
```

### 6. Verify Fix
Test this query in SQL Editor:
```sql
SELECT t.*, ti.quantity, ti.unit_price
FROM transactions t
JOIN transaction_items ti ON ti.transaction_id = t.id
LIMIT 5;
```

### 7. Test API Call
After fixing, this should work:
```js
const { data, error } = await supabase
  .from('transactions')
  .select(`
    *,
    transaction_items (
      quantity,
      unit_price,
      products (
        category
      )
    )
  `);
```

## Expected Outcome
- ✅ No more PGRST201 errors
- ✅ Category mix data loads from real database
- ✅ All transaction-item relationships work
- ✅ Dashboard shows real data instead of fallbacks

## Critical Notes
- This is a **database configuration issue**, not code
- Fix must be done in Supabase Dashboard/SQL Editor
- No application restart needed after fix
- All pages will immediately start working with real data

## Files Created
- `fix-supabase-relationships.sql` - Diagnostic and fix SQL
- This guide for step-by-step instructions

## Test After Fix
1. Refresh your dashboard
2. Check category mix shows real data
3. Verify no console errors about PGRST201
4. Confirm transaction data loads properly