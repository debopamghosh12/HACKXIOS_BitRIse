# Patient ID Database Connection Guide

## Overview

This guide explains how the patient ID connects across all tables in your database.

## Database Structure

### 1. **Auth Flow**
```
auth.users (Supabase Auth)
    ↓ (id)
public.users (Basic user info)
    ↓ (id)
public.patients (Medical info)
```

### 2. **Table Relationships**

```
┌─────────────┐
│ auth.users  │ (Supabase managed)
│ - id (UUID) │
└──────┬──────┘
       │
       ↓ Foreign Key
┌─────────────────────┐
│ public.users        │
│ - id (UUID) PK      │ ←─────┐
│ - full_name         │       │
│ - email             │       │
│ - phone             │       │
└─────────────────────┘       │
                              │
┌─────────────────────┐       │
│ public.patients     │       │
│ - id (UUID) PK      │───────┘
│ - date_of_birth     │
│ - gender            │
│ - blood_group       │
│ - allergies         │
│ - chronic_diseases  │
└─────────────────────┘
       │
       │ patient_id references users(id)
       ├──────────────────────────────────┐
       │                                  │
       ↓                                  ↓
┌──────────────────┐            ┌─────────────────┐
│ subscriptions    │            │ payments        │
│ - patient_id     │            │ - patient_id    │
│ - medicine_id    │            │ - amount        │
│ - quantity       │            │ - transaction_id│
│ - next_refill    │            └─────────────────┘
└──────────────────┘
       │
       ↓
┌──────────────────┐
│ routines         │
│ - patient_id     │
│ - medicine_name  │
│ - reminder_time  │
└──────────────────┘
```

## Key Points

### Patient ID = User ID
- The `patient_id` in subscriptions, payments, and routines is the **same as** `users.id`
- This `id` comes from `auth.users.id` (Supabase Auth UUID)

### Foreign Key Relationships
All tables reference `public.users(id)`:
- ✅ `subscriptions.patient_id` → `users.id`
- ✅ `payments.patient_id` → `users.id`
- ✅ `routines.patient_id` → `users.id`
- ✅ `patients.id` → `users.id`

### Cascade Deletes
If a user is deleted from `auth.users`:
1. Their record in `users` is deleted (CASCADE)
2. Their `patients` record is deleted (CASCADE)
3. All their `subscriptions` are deleted (CASCADE)
4. All their `payments` are deleted (CASCADE)
5. All their `routines` are deleted (CASCADE)

## How It Works

### 1. User Signs Up
```python
# In main.py
auth_response = supabase.auth.sign_up({
    "email": email,
    "password": password
})

user_id = auth_response.user.id  # This is the patient_id!

# Auto-created by trigger
supabase.table('users').insert({
    "id": user_id,  # Same ID from auth
    "full_name": name,
    "email": email
})
```

### 2. User Creates Subscription
```python
# patient_id is the user's auth ID
supabase.table('subscriptions').insert({
    "patient_id": user_id,  # From auth.users.id
    "medicine_id": 123,
    "quantity_per_order": 30
})
```

### 3. User Makes Payment
```python
supabase.table('payments').insert({
    "patient_id": user_id,  # Same ID
    "subscription_id": 456,
    "amount": 500.00
})
```

### 4. User Sets Routine
```python
supabase.table('routines').insert({
    "patient_id": user_id,  # Same ID
    "medicine_name": "Paracetamol",
    "reminder_time": "08:00 AM"
})
```

## Setup Instructions

### 1. Run the SQL Script
```bash
# In Supabase SQL Editor, run:
complete-schema.sql
```

### 2. Verify Tables
```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Expected: users, patients, medicines, subscriptions, payments, routines
```

### 3. Verify Foreign Keys
```sql
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

## Frontend Integration

### Getting Current User ID
```typescript
// In your React app
import { getCurrentUser } from './services/auth';

const user = await getCurrentUser();
const patientId = user?.id; // This is your patient_id!
```

### Creating Subscription
```typescript
import { createSubscription } from './services/api';

await createSubscription({
  user_id: patientId,  // From getCurrentUser()
  medicine_id: selectedMedicine.id,
  quantity: 30,
  dosage_per_day: 2
});
```

## Testing

### 1. Create Test User
```sql
-- Sign up via your app, then check:
SELECT * FROM users WHERE email = 'test@example.com';
-- Should return user with UUID id
```

### 2. Create Test Subscription
```sql
-- After creating subscription via app:
SELECT s.*, u.full_name, m.brand_name
FROM subscriptions s
JOIN users u ON s.patient_id = u.id
JOIN medicines m ON s.medicine_id = m.id
WHERE u.email = 'test@example.com';
```

### 3. Verify Relationships
```sql
-- Get all data for a user
SELECT 
  u.full_name,
  u.email,
  COUNT(DISTINCT s.id) as subscription_count,
  COUNT(DISTINCT p.id) as payment_count,
  COUNT(DISTINCT r.id) as routine_count
FROM users u
LEFT JOIN subscriptions s ON s.patient_id = u.id
LEFT JOIN payments p ON p.patient_id = u.id
LEFT JOIN routines r ON r.patient_id = u.id
WHERE u.email = 'test@example.com'
GROUP BY u.id, u.full_name, u.email;
```

## Summary

✅ **One ID to Rule Them All**: `auth.users.id` = `users.id` = `patient_id`  
✅ **Foreign Keys**: All tables properly reference `users.id`  
✅ **Cascade Deletes**: Deleting a user cleans up all related data  
✅ **RLS Policies**: Users can only access their own data  
✅ **Auto-creation**: User record created automatically on signup  

Your database is now properly structured with patient ID connecting everything!
