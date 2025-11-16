# Validation Guide

This document explains the validation rules for creating and updating resources in the Budget Manager API.

## Overview

All inputs are validated by the `ValidationService` which ensures:
- Data types are correct
- Values are within acceptable ranges
- Business rules are enforced
- Invalid requests are rejected with clear error messages

## Category Validation

### Create Category

**Endpoint:** `POST /api/categories`

**Request Body:**
```json
{
  "name": "Food",
  "period": "2024-11",
  "monthlyBudget": 500.00
}
```

**Validation Rules:**

| Field | Type | Rules | Example |
|-------|------|-------|---------|
| `name` | string | ✅ Non-empty<br>✅ Max 100 characters | "Food", "Transportation" |
| `period` | string | ✅ Format: YYYY-MM<br>✅ Month 01-12<br>✅ Year 1900-2100 | "2024-11", "2025-01" |
| `monthlyBudget` | number | ✅ Positive number (> 0)<br>✅ Max 2 decimals | 500, 500.50, 1000.00 |

**Error Examples:**
```json
{
  "error": "Validation failed:\nname: name cannot be empty"
}
```

---

## Expense Validation

### Create Expense

**Endpoint:** `POST /api/expenses`

**Request Body:**
```json
{
  "description": "Lunch at restaurant",
  "amount": 25.50,
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2024-11-15T12:30:00Z",
  "paymentMethod": "CASH",
  "provisionId": null
}
```

**Validation Rules:**

| Field | Type | Rules | Example |
|-------|------|-------|---------|
| `description` | string | ✅ Non-empty<br>✅ Max 200 characters | "Lunch", "Gas station" |
| `amount` | number | ✅ Positive number (> 0)<br>✅ Max 2 decimals<br>⚠️ Converted to negative internally | 25.50, 100, 99.99 |
| `categoryId` | UUID | ✅ Valid UUID format | "550e8400-e29b-41d4-a716-446655440000" |
| `date` | Date ISO | ✅ Valid date<br>✅ Not in future | "2024-11-15T12:30:00Z" |
| `paymentMethod` | enum | ✅ One of: CASH, TRANSFER, CARD, OTHER<br>✅ Optional (defaults to CASH) | "CASH", "TRANSFER" |
| `provisionId` | UUID | ✅ Valid UUID format<br>✅ Optional | "550e8400-e29b-41d4-a716-446655440000" |

**Important Notes:**
- ✅ Send **positive** amounts (e.g., 25.50)
- ✅ System automatically converts to negative (e.g., -25.50)
- ✅ Negative amounts represent a debit (money going out)

**Error Examples:**
```json
{
  "error": "Validation failed:\ndescription: description cannot be empty"
}
```

```json
{
  "error": "Validation failed:\namount: amount must be a positive number"
}
```

```json
{
  "error": "Validation failed:\ncategoryId: categoryId must be a valid UUID"
}
```

### Update Expense

**Endpoint:** `PUT /api/expenses/:id`

**Request Body:**
```json
{
  "description": "Lunch update",
  "amount": 30.00,
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2024-11-15T12:30:00Z",
  "paymentMethod": "CARD"
}
```

**Notes:**
- All fields are optional
- Same validation rules as create
- Only provided fields are updated

---

## Provision Validation

### Create Provision

**Endpoint:** `POST /api/provisions`

**Request Body:**
```json
{
  "item": "Office supplies",
  "amount": 200.00,
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "dueDate": "2024-12-31T23:59:59Z",
  "notes": "For quarterly office needs"
}
```

**Validation Rules:**

| Field | Type | Rules | Example |
|-------|------|-------|---------|
| `item` | string | ✅ Non-empty<br>✅ Max 100 characters | "Office supplies", "Equipment" |
| `amount` | number | ✅ Positive number (> 0)<br>✅ Max 2 decimals<br>⚠️ Converted to negative internally | 200.00, 500, 99.99 |
| `categoryId` | UUID | ✅ Valid UUID format | "550e8400-e29b-41d4-a716-446655440000" |
| `dueDate` | Date ISO | ✅ Valid date<br>✅ Any date (future allowed) | "2024-12-31T23:59:59Z" |
| `notes` | string | ✅ Max 500 characters<br>✅ Optional | "For quarterly office needs" |

**Important Notes:**
- ✅ Send **positive** amounts (e.g., 200.00)
- ✅ System automatically converts to negative (e.g., -200.00)
- ✅ Negative amounts represent reserved debt (money reserved but not yet spent)
- ✅ `dueDate` can be in future (it's a deadline, not a transaction date)

**Error Examples:**
```json
{
  "error": "Validation failed:\nitem: item cannot be empty"
}
```

```json
{
  "error": "Validation failed:\namount: amount must be a positive number"
}
```

### Update Provision

**Endpoint:** `PUT /api/provisions/:id`

**Request Body:**
```json
{
  "item": "Office supplies (updated)",
  "amount": 250.00,
  "dueDate": "2025-01-15T23:59:59Z",
  "status": "CLOSED",
  "notes": "Updated budget"
}
```

**Validation Rules:**

| Field | Type | Rules | Example |
|-------|------|-------|---------|
| `item` | string | ✅ Non-empty<br>✅ Max 100 characters | "Office supplies" |
| `amount` | number | ✅ Positive number (> 0)<br>✅ Max 2 decimals | 250.00 |
| `dueDate` | Date ISO | ✅ Valid date | "2025-01-15T23:59:59Z" |
| `status` | enum | ✅ One of: OPEN, CLOSED | "OPEN", "CLOSED" |
| `notes` | string | ✅ Max 500 characters<br>✅ Optional | "Updated budget" |

**Notes:**
- All fields are optional
- Same validation rules as create

---

## Common Validation Errors

### 1. "Field cannot be empty"
**Problem:** You sent an empty string or null for a required text field
```json
{
  "description": "",  // ❌ Invalid
  "item": null        // ❌ Invalid
}
```

**Solution:** Provide a non-empty string
```json
{
  "description": "Lunch",  // ✅ Valid
  "item": "Office supplies"  // ✅ Valid
}
```

---

### 2. "Field must be a positive number"
**Problem:** Amount is zero or negative
```json
{
  "amount": 0,    // ❌ Invalid (must be > 0)
  "amount": -50   // ❌ Invalid (send positive, system converts)
}
```

**Solution:** Send positive number greater than zero
```json
{
  "amount": 25.50,  // ✅ Valid (will be converted to -25.50)
  "amount": 100     // ✅ Valid (will be converted to -100)
}
```

---

### 3. "Field cannot exceed X characters"
**Problem:** String is too long
```json
{
  "description": "This is a very very very... [201 characters]"  // ❌ Too long
}
```

**Solution:** Shorten the text
```json
{
  "description": "Lunch at restaurant"  // ✅ Valid (30 chars < 200)
}
```

---

### 4. "Field cannot have more than 2 decimal places"
**Problem:** Too many decimal places
```json
{
  "amount": 25.999  // ❌ 3 decimals
}
```

**Solution:** Round to 2 decimal places
```json
{
  "amount": 26.00   // ✅ Valid
  "amount": 25.50   // ✅ Valid
}
```

---

### 5. "Field must be a valid UUID"
**Problem:** Invalid UUID format
```json
{
  "categoryId": "not-a-uuid"  // ❌ Invalid format
  "categoryId": "12345"       // ❌ Invalid format
}
```

**Solution:** Use valid UUID v4 format
```json
{
  "categoryId": "550e8400-e29b-41d4-a716-446655440000"  // ✅ Valid UUID
}
```

---

### 6. "Field must be in YYYY-MM format"
**Problem:** Period format is incorrect
```json
{
  "period": "2024/11"    // ❌ Wrong separator
  "period": "11-2024"    // ❌ Wrong order
  "period": "2024-1"     // ❌ Missing leading zero
}
```

**Solution:** Use YYYY-MM format with zero-padded month
```json
{
  "period": "2024-11"    // ✅ Valid
  "period": "2025-01"    // ✅ Valid
}
```

---

### 7. "Field must be a valid date"
**Problem:** Date format is invalid
```json
{
  "date": "2024-11-15"                    // ❌ Missing time/timezone
  "date": "15/11/2024"                    // ❌ Wrong format
  "date": new Date()                      // ❌ JavaScript object
}
```

**Solution:** Use ISO 8601 date format
```json
{
  "date": "2024-11-15T12:30:00Z"         // ✅ Valid
  "date": "2024-11-15T12:30:00+01:00"    // ✅ Valid
}
```

---

### 8. "Field cannot be in the future" (for expenses only)
**Problem:** Expense date is in the future
```json
{
  "date": "2025-12-15T12:30:00Z"  // ❌ Future date (for expense)
}
```

**Solution:** Use today or past date for expenses
```json
{
  "date": "2024-11-15T12:30:00Z"  // ✅ Valid (today or past)
}
```

**Note:** Provisions CAN have future dates (they're deadlines)

---

### 9. "Field must be one of: ..."
**Problem:** Invalid enum value
```json
{
  "paymentMethod": "BITCOIN"    // ❌ Invalid
  "status": "PENDING"           // ❌ Invalid
}
```

**Solution:** Use one of the valid enum values
```json
{
  "paymentMethod": "CASH"      // ✅ Valid (CASH, TRANSFER, CARD, OTHER)
  "status": "OPEN"             // ✅ Valid (OPEN, CLOSED)
}
```

---

## Complete Request Examples

### ✅ Valid Expense Creation
```json
POST /api/expenses
{
  "description": "Grocery shopping",
  "amount": 85.50,
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2024-11-15T14:30:00Z",
  "paymentMethod": "CARD"
}
```

### ✅ Valid Provision Creation
```json
POST /api/provisions
{
  "item": "Winter clothing",
  "amount": 300.00,
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "dueDate": "2024-12-31T23:59:59Z",
  "notes": "Budget for family winter clothes"
}
```

### ✅ Valid Category Creation
```json
POST /api/categories
{
  "name": "Groceries",
  "period": "2024-11",
  "monthlyBudget": 500.00
}
```

---

## Validation Flow Diagram

```
User Input
    ↓
ValidationService.collectErrors()
    ├→ validateNonEmptyString()
    ├→ validateMaxLength()
    ├→ validatePositiveNumber()
    ├→ validateUUID()
    ├→ validateDate()
    ├→ validateEnum()
    └→ ... other validations
    ↓
Has Errors?
    ├→ YES: Throw ValidationError (HTTP 400)
    └→ NO: Continue to business logic
    ↓
Business Logic (Use Cases)
    ├→ Convert positive amounts to negative
    ├→ Check category exists
    ├→ Create record in database
    └→ Return created object
    ↓
API Response (HTTP 201)
```

---

## Tips for Valid Input

1. **Always send positive amounts** for both expenses and provisions
   - Expense: 25.50 → stored as -25.50
   - Provision: 200.00 → stored as -200.00

2. **Use ISO 8601 format** for dates
   - Good: "2024-11-15T12:30:00Z"
   - Bad: "11/15/2024", "15-11-2024"

3. **Validate UUIDs** before sending
   - Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - Example: `550e8400-e29b-41d4-a716-446655440000`

4. **Check period format** for categories
   - Format: "YYYY-MM"
   - Valid: "2024-11", "2025-01"
   - Invalid: "2024/11", "11-2024"

5. **Keep descriptions concise**
   - Max 200 characters for expenses
   - Max 100 characters for provision items
   - Max 500 characters for notes

6. **Use enums correctly**
   - Payment Methods: CASH, TRANSFER, CARD, OTHER
   - Provision Status: OPEN, CLOSED

---

## Getting Help

If you receive validation errors:

1. **Check the error message** - it tells you exactly what's wrong
2. **Refer to this guide** - find your error type above
3. **Review the validation rules** - ensure all fields match requirements
4. **Check data types** - make sure types match (string, number, date, UUID)
5. **Verify enum values** - ensure you're using allowed values
