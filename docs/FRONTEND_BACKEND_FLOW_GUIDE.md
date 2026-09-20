# Complete Frontend-to-Backend Flow & Execution Guide

This document illustrates the exact end-to-end flow for every scenario in the system:
- **What the frontend sends** (HTTP Request & Payload)
- **What the backend validates** (Auth, Zod, and Lookup Cache)
- **How the database updates** (SCD Type 2 Version Chaining)
- **What the backend responds** (HTTP Status & Response JSON)

---

# TABLE OF CONTENTS
1. [Core Pipeline Overview](#1-core-pipeline-overview)
2. [Scenario 1: Single-Entity Initial Save (Basic Info - First Time)](#scenario-1-single-entity-initial-save-basic-info---first-time)
3. [Scenario 2: Single-Entity Update (Basic Info - Subsequent Edit)](#scenario-2-single-entity-update-basic-info---subsequent-edit)
4. [Scenario 3: Single-Entity Fetch (Active Form Load vs. Audit History)](#scenario-3-single-entity-fetch-active-form-load-vs-audit-history)
5. [Scenario 4: Multi-Entity Item Creation (Adding Languages)](#scenario-4-multi-entity-item-creation-adding-languages)
6. [Scenario 5: Multi-Entity Isolated Update (Editing 1 Language)](#scenario-5-multi-entity-isolated-update-editing-1-language)
7. [Scenario 6: Multi-Entity Soft-Delete (Removing a Language)](#scenario-6-multi-entity-soft-delete-removing-a-language)
8. [Scenario 7: Multi-Entity History Queries (Single Item vs. Full Tab)](#scenario-7-multi-entity-history-queries-single-item-vs-full-tab)
9. [Scenario 8: Validation Failures & Edge Cases (Postman Attack & Inactive Enums)](#scenario-8-validation-failures--edge-cases)

---

# 1. Core Pipeline Overview

Every request passes through the same 4-layer architecture:

```
[ Frontend HTTP Request ]
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ 1. Auth Middleware (`protect`)                         │
│    - Decodes JWT access token                          │
│    - Injects `req.employee`                            │
└────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ 2. Zod Validator (`validate(schema)`)                  │
│    - Validates data types, lengths, required fields    │
│    - Verifies enum codes against in-memory cache       │
│    - Strips unauthorized injections (`version`, `_id`) │
└────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ 3. Controller Layer                                    │
│    - Extracts `req.employee._id` and sanitized body    │
│    - Hands off to `versionedCrud` Service              │
└────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ 4. `versionedCrud` SCD Type 2 Engine                   │
│    - Atomically deactivates previous active record     │
│    - Creates new record pointing to `previousRecord`   │
│    - Increments `version = old.version + 1`            │
└────────────────────────────────────────────────────────┘
          │
          ▼
[ MongoDB Database Collection ]
```

---

# Scenario 1: Single-Entity Initial Save (Basic Info - First Time)

An employee fills in their Basic Info tab for the very first time.

### 1. Frontend Action
* **Endpoint**: `PUT /api/v1/employee/basic-info`
* **Headers**: `Content-Type: application/json`
* **Cookies**: `accessToken=<JWT>`
* **Payload**:
```json
{
  "fullName": "Muhammad Ali",
  "gender": "MALE",
  "maritalStatus": "SINGLE",
  "dateOfBirth": "1995-05-12",
  "placeOfBirth": {
    "country": "PK",
    "city": "LAHORE",
    "district": "LAHORE_DIST",
    "town": "MODEL_TOWN",
    "localityOrMuhalla": "House 12, Block B"
  },
  "notes": "Initial personal record"
}
```

### 2. Backend Processing
1. **Auth Middleware**: Verifies token $\rightarrow$ sets `req.employee._id = "67db001"`.
2. **Zod Middleware (`basicInfoSchema`)**:
   - Validates `fullName` (length $\ge 2$).
   - Validates `gender` against Lookup Cache (`"MALE"` is active $\rightarrow$ passes).
   - Validates `maritalStatus` against Lookup Cache (`"SINGLE"` is active $\rightarrow$ passes).
   - Coerces `"1995-05-12"` to Date object.
3. **Controller**: Calls `versionedCrud.saveSingle(EmployeeBasicInfo, employeeId, req.body, changedBy)`.
4. **SCD2 Engine**:
   - Queries: `findOne({ employeeId: "67db001", isCurrent: true, isDeleted: false })` $\rightarrow$ returns `null`.
   - Executes: `EmployeeBasicInfo.create(...)` with `version: 1`, `isCurrent: true`, `previousRecord: null`, `actionType: "CREATE"`.

### 3. Database State (1 Document Created)
```json
{
  "_id": "67f0001",
  "employeeId": "67db001",
  "fullName": "Muhammad Ali",
  "gender": "MALE",
  "maritalStatus": "SINGLE",
  "dateOfBirth": "1995-05-12T00:00:00.000Z",
  "placeOfBirth": {
    "country": "PK",
    "city": "LAHORE",
    "district": "LAHORE_DIST",
    "town": "MODEL_TOWN",
    "localityOrMuhalla": "House 12, Block B"
  },
  "notes": "Initial personal record",
  "version": 1,
  "isCurrent": true,
  "isDeleted": false,
  "previousRecord": null,
  "actionType": "CREATE",
  "changedBy": "67db001",
  "createdAt": "2026-03-20T10:00:00.000Z"
}
```

### 4. Backend Response
* **HTTP Status**: `200 OK`
* **Body**:
```json
{
  "statusCode": 200,
  "data": {
    "_id": "67f0001",
    "fullName": "Muhammad Ali",
    "gender": "MALE",
    "maritalStatus": "SINGLE",
    "version": 1,
    "isCurrent": true
  },
  "message": "Basic info saved successfully.",
  "success": true
}
```

---

# Scenario 2: Single-Entity Update (Basic Info - Subsequent Edit)

Six months later, the employee gets married and updates their marital status from `"SINGLE"` to `"MARRIED"`.

### 1. Frontend Action
* **Endpoint**: `PUT /api/v1/employee/basic-info`
* **Payload**:
```json
{
  "fullName": "Muhammad Ali",
  "gender": "MALE",
  "maritalStatus": "MARRIED",
  "dateOfBirth": "1995-05-12",
  "placeOfBirth": {
    "country": "PK",
    "city": "LAHORE",
    "district": "LAHORE_DIST",
    "town": "MODEL_TOWN",
    "localityOrMuhalla": "House 12, Block B"
  },
  "notes": "Updated marital status after wedding"
}
```

### 2. Backend Processing
1. **Auth & Zod**: Validates all fields, confirms `"MARRIED"` is an active lookup code.
2. **SCD2 Engine (`saveSingle`)**:
   - Queries current active: `findOne({ employeeId: "67db001", isCurrent: true })` $\rightarrow$ finds `67f0001` (Version 1).
   - **Step 1 (Deactivate Old)**:
     `findByIdAndUpdate("67f0001", { $set: { isCurrent: false } })`
   - **Step 2 (Insert New Version)**:
     Creates Version 2 with:
     - `version: 2`
     - `isCurrent: true`
     - `previousRecord: "67f0001"` (pointers to Version 1)
     - `actionType: "UPDATE"`
     - `changedBy: "67db001"`

### 3. Database State (2 Documents in Collection)

| `_id` | Status | `version` | `isCurrent` | `previousRecord` | `maritalStatus` | `actionType` |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| `67f0001` | Historical Archive | 1 | `false` | `null` | SINGLE | CREATE |
| **`67f0002`** | **Current Active** | **2** | **`true`** | **`67f0001`** | **MARRIED** | **UPDATE** |

### 4. Backend Response
* **HTTP Status**: `200 OK`
* **Body**:
```json
{
  "statusCode": 200,
  "data": {
    "_id": "67f0002",
    "fullName": "Muhammad Ali",
    "maritalStatus": "MARRIED",
    "version": 2,
    "isCurrent": true,
    "previousRecord": "67f0001"
  },
  "message": "Basic info saved successfully.",
  "success": true
}
```

---

# Scenario 3: Single-Entity Fetch (Active Form Load vs. Audit History)

### Case A: User Opens the Form to View Their Profile
* **Frontend Request**: `GET /api/v1/employee/basic-info`
* **Database Query**:
  ```javascript
  EmployeeBasicInfo.findOne({ employeeId: "67db001", isCurrent: true, isDeleted: false })
  ```
  *(Scans the tiny Partial Index in < 1ms, completely ignoring historical Version 1).*
* **Response**: Returns **only `67f0002`** (Version 2, Married).

### Case B: HR/Admin Opens the Change Log / Audit History Tab
* **Frontend Request**: `GET /api/v1/employee/basic-info/history`
* **Database Query**:
  ```javascript
  EmployeeBasicInfo.find({ employeeId: "67db001" }).sort({ version: -1 })
  ```
* **Response**:
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "67f0002",
      "version": 2,
      "maritalStatus": "MARRIED",
      "isCurrent": true,
      "actionType": "UPDATE",
      "previousRecord": "67f0001",
      "createdAt": "2026-09-20T17:00:00.000Z"
    },
    {
      "_id": "67f0001",
      "version": 1,
      "maritalStatus": "SINGLE",
      "isCurrent": false,
      "actionType": "CREATE",
      "previousRecord": null,
      "createdAt": "2026-03-20T10:00:00.000Z"
    }
  ],
  "message": "Basic info history retrieved successfully."
}
```
*HR can immediately see who changed what and when!*

---

# Scenario 4: Multi-Entity Item Creation (Adding Languages)

In multi-entity forms (Languages, Education, Contacts), an employee can have multiple records. Each language entry is an independent document.

### 1. Adding English
* **Frontend Request**: `POST /api/v1/employee/languages`
* **Payload**:
```json
{
  "name": "ENGLISH",
  "canSpeak": true,
  "speakingLevel": "AVERAGE",
  "canWrite": true,
  "writingLevel": "HIGH",
  "canRead": true,
  "readingLevel": "HIGH",
  "notes": "Working proficiency"
}
```
* **Backend Processing (`createMulti`)**:
  - Creates new document `lang_101`.
  - Sets **`rootRecordId = "lang_101"`** (anchors all future edits of English to this root ID).
  - Sets `version: 1`, `isCurrent: true`.

### 2. Adding Urdu
* **Frontend Request**: `POST /api/v1/employee/languages`
* **Payload**:
```json
{
  "name": "URDU",
  "canSpeak": true,
  "speakingLevel": "HIGH",
  "canWrite": true,
  "writingLevel": "HIGH",
  "canRead": true,
  "readingLevel": "HIGH",
  "notes": "Native language"
}
```
* **Backend Processing**:
  - Creates document `lang_201`.
  - Sets **`rootRecordId = "lang_201"`**.

### 3. Database State (2 Active Independent Rows)
| `_id` | `rootRecordId` | Language | Speaking | `version` | `isCurrent` | `previousRecord` |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| `lang_101` | `lang_101` | ENGLISH | AVERAGE | 1 | `true` | `null` |
| `lang_201` | `lang_201` | URDU | HIGH | 1 | `true` | `null` |

---

# Scenario 5: Multi-Entity Isolated Update (Editing 1 Language)

User attends an English course and improves their speaking level from `"AVERAGE"` to `"HIGH"`.

### 1. Frontend Action
* **Endpoint**: `PUT /api/v1/employee/languages/lang_101`
* **Payload**:
```json
{
  "name": "ENGLISH",
  "canSpeak": true,
  "speakingLevel": "HIGH",
  "canWrite": true,
  "writingLevel": "HIGH",
  "canRead": true,
  "readingLevel": "HIGH",
  "notes": "Completed advanced certification"
}
```

### 2. Backend Processing (`updateMulti`)
1. Finds `lang_101` where `isCurrent: true`.
2. **Deactivates `lang_101`**: `findByIdAndUpdate("lang_101", { isCurrent: false })`.
3. **Inserts `lang_102`**:
   - `rootRecordId`: Inherits `"lang_101"`.
   - `version: 2`.
   - `previousRecord: "lang_101"`.
   - `isCurrent: true`.
4. **URDU (`lang_201`) is 100% UNTOUCHED**: Zero writes, zero locks, zero duplication!

### 3. Database State After Edit
| `_id` | `rootRecordId` | Language | Speaking | `version` | `isCurrent` | `previousRecord` | Status |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `lang_101` | `lang_101` | ENGLISH | AVERAGE | 1 | `false` | `null` | Archived |
| **`lang_102`** | `lang_101` | **ENGLISH** | **HIGH** | **2** | **`true`** | **`lang_101`** | **Current Active** |
| **`lang_201`** | `lang_201` | **URDU** | **HIGH** | **1** | **`true`** | **`null`** | **Current Active** |

### 4. What Frontend Sees on `GET /api/v1/employee/languages`:
The active query returns exactly the two current records:
`[ lang_102 (English High), lang_201 (Urdu High) ]`.

---

# Scenario 6: Multi-Entity Soft-Delete (Removing a Language)

The employee wants to remove Urdu from their profile.

### 1. Frontend Action
* **Endpoint**: `DELETE /api/v1/employee/languages/lang_201`

### 2. Backend Processing (`deleteMulti`)
1. Finds `lang_201` where `isCurrent: true`.
2. Sets `lang_201` $\rightarrow$ `isCurrent: false`.
3. Inserts an **Audit Tombstone** (`lang_202`):
   - `rootRecordId: "lang_201"`
   - `version: 2`
   - `isCurrent: false`
   - `isDeleted: true`
   - `actionType: "DELETE"`
   - `previousRecord: "lang_201"`

### 3. Database State
| `_id` | `rootRecordId` | Language | `version` | `isCurrent` | `isDeleted` | `actionType` |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| `lang_102` | `lang_101` | ENGLISH | 2 | `true` | `false` | UPDATE (Active) |
| `lang_201` | `lang_201` | URDU | 1 | `false` | `false` | Historical |
| `lang_202` | `lang_201` | URDU | 2 | `false` | `true` | **DELETE Tombstone** |

### 4. What Frontend Sees on `GET /api/v1/employee/languages`:
* Query `{ isCurrent: true, isDeleted: false }` returns **only `lang_102` (English)**.
* Urdu is no longer visible on the form, but its entire historical audit lineage is safely preserved in MongoDB!

---

# Scenario 7: Multi-Entity History Queries

### A. History of Just ONE Language (e.g., English History)
* **Frontend Request**: `GET /api/v1/employee/languages/lang_102/history`
* **Query**: `find({ rootRecordId: "lang_101" }).sort({ version: -1 })`
* **Result**:
```json
[
  { "version": 2, "language": "ENGLISH", "speakingLevel": "HIGH", "isCurrent": true },
  { "version": 1, "language": "ENGLISH", "speakingLevel": "AVERAGE", "isCurrent": false }
]
```

### B. Entire Activity Log of ALL Languages for this Employee
* **Frontend Request**: `GET /api/v1/employee/languages/history/all`
* **Query**: `find({ employeeId: "67db001" }).sort({ createdAt: -1 })`
* **Result**: Shows chronological stream:
  1. `lang_202`: "URDU deleted" by EMP_101 on 2026-09-20
  2. `lang_102`: "ENGLISH updated" by EMP_101 on 2026-08-10
  3. `lang_201`: "URDU created" by EMP_101 on 2026-01-15
  4. `lang_101`: "ENGLISH created" by EMP_101 on 2026-01-15

---

# Scenario 8: Validation Failures & Edge Cases

### Edge Case A: Postman Attacker Sends Invalid Enum
* **Attacker sends**: `gender: "SUPER_HUMAN"`
* **Backend Processing**:
  - `lookupCodeValidator("GENDER")` queries in-memory lookup cache.
  - `"SUPER_HUMAN"` does not exist in `GENDER` category.
  - Request is stopped **before reaching controller or database**.
* **Response (`400 Bad Request`)**:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "gender",
      "message": "Invalid GENDER: 'SUPER_HUMAN'. Valid options are: MALE, FEMALE, OTHER"
    }
  ],
  "success": false
}
```

---

### Edge Case B: Grandfathering an Inactive Enum on Existing Record
1. Admin deactivates `MARRIED` in lookups (`isActive: false`).
2. Employee who is *already* `MARRIED` updates only their `notes` field.
3. Form sends back `maritalStatus: "MARRIED"` along with the new notes.
4. **Backend Processing**:
   - `lookup.service.js` checks:
     Is `"MARRIED"` active? $\rightarrow$ `false`.
     Is `"MARRIED"` identical to the existing record's value? $\rightarrow$ `true`.
   - **Allowed!** The update succeeds without forcing the user to change their marital status.
5. If another employee tries to *switch* to `"MARRIED"`, the backend rejects with:
   `"'MARRIED' is inactive/discontinued and cannot be selected for new changes."`

---

# Summary Cheat Sheet

| Operation | Single-Entity (Basic Info / CNIC) | Multi-Entity (Languages / Education) |
| :--- | :--- | :--- |
| **Initial Creation** | `PUT /` (auto-creates V1) | `POST /` (sets `rootRecordId = _id`, V1) |
| **Update** | `PUT /` (old $\rightarrow$ `isCurrent: false`, new V+1) | `PUT /:id` (old $\rightarrow$ `isCurrent: false`, new V+1 preserving `rootRecordId`) |
| **Delete** | `DELETE /` (tombstone V+1) | `DELETE /:id` (tombstone V+1 for *only that item*) |
| **Active Read** | `findOne({ isCurrent: true, isDeleted: false })` | `find({ isCurrent: true, isDeleted: false })` |
| **Item History** | `find({ employeeId }).sort({ version: -1 })` | `find({ rootRecordId }).sort({ version: -1 })` |
| **Global History** | Same as above | `find({ employeeId }).sort({ createdAt: -1 })` |
