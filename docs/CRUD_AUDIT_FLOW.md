# CRUD & Audit Flow Architecture: SCD Type 2 Version-Chaining

## 1. Overview & Core Principles

This system uses **Slowly Changing Dimensions Type 2 (SCD Type 2)** with **Version Chaining** to handle high-volume employee data and complete audit tracking across all forms.

### Key Rules:
1. **Never Mutate Historical State**: An update is never an in-place overwrite. It is an atomic sequence of deactivating the existing active version (`isCurrent: false`) and inserting a new active version (`isCurrent: true`).
2. **Tab & Entity Isolation**: Each form or sub-entity has its own dedicated collection linked via `employeeId`. Updating one sub-form (e.g., Languages) does not lock, touch, or mutate another (e.g., Basic Info, Addresses).
3. **Atomic Multi-Entity Updates**: For forms with arrays (Education, Languages, Contacts), each item is an independent document. Editing *one* language versions *only that language*, leaving all other languages untouched.
4. **Partial Index Performance**: Active queries only scan active records through MongoDB Partial Indexes. Query speed never degrades as historical audit records grow over time.

---

## 2. Standard Versioning & Audit Schema Header

Every versioned collection embeds this header schema:

```javascript
import { Schema } from "mongoose";
import { ref, bool, num, enumStr, dateNow } from "../utils/mongoose.js";

export const versioningHeader = () => ({
  // The employee who owns this record
  employeeId: ref("Employee", true, { index: true }),

  // For multi-entity collections: links all versions of a specific item (e.g. English V1, V2, V3)
  // For single-entity collections: defaults to null or self-id
  rootRecordId: { type: Schema.Types.ObjectId, default: null, index: true },

  // Incrementing version number (1, 2, 3...)
  version: num(1, true),

  // Flags indicating current active state
  isCurrent: bool(true, true),
  isDeleted: bool(false, true),

  // Lineage pointer: references the immediate previous version's _id
  previousRecord: ref(null, false, { default: null }),

  // Audit context: action and actor
  actionType: enumStr(["CREATE", "UPDATE", "DELETE"], "CREATE", true),
  changedBy: ref("Employee", true),

  effectiveDate: dateNow(),
});
```

---

## 3. Case A: Single-Entity Form CRUD (e.g., Basic Info, CNIC, Addresses)

An employee has **only one active record** at any given moment.

### A. CREATE (Add Initial Record)
```javascript
const newBasicInfo = await EmployeeBasicInfo.create({
  employeeId,
  fullName: "Muhammad Ali",
  maritalStatus: "Single",
  dateOfBirth: "1995-05-12",
  version: 1,
  isCurrent: true,
  isDeleted: false,
  previousRecord: null,
  actionType: "CREATE",
  changedBy: req.employee._id,
});
```
**Database Document:**
```json
{
  "_id": "basic_001",
  "employeeId": "EMP_101",
  "fullName": "Muhammad Ali",
  "maritalStatus": "Single",
  "version": 1,
  "isCurrent": true,
  "isDeleted": false,
  "previousRecord": null,
  "actionType": "CREATE",
  "changedBy": "EMP_101"
}
```

### B. READ Active Record (Frontend Form Load)
```javascript
const basicInfo = await EmployeeBasicInfo.findOne({
  employeeId,
  isCurrent: true,
  isDeleted: false,
});
```

### C. UPDATE (Atomic Deactivate + Insert New Version)
User updates marital status to "Married":
```javascript
const currentRecord = await EmployeeBasicInfo.findOne({
  employeeId,
  isCurrent: true,
  isDeleted: false,
});

if (!currentRecord) throw new ApiError(404, "Record not found");

// 1. Mark existing version as historical
await EmployeeBasicInfo.findByIdAndUpdate(currentRecord._id, {
  $set: { isCurrent: false },
});

// 2. Insert new version pointing to previous
const updatedRecord = await EmployeeBasicInfo.create({
  ...req.body,
  employeeId,
  version: currentRecord.version + 1,
  isCurrent: true,
  isDeleted: false,
  previousRecord: currentRecord._id,
  actionType: "UPDATE",
  changedBy: req.employee._id,
});
```

**Collection State After Update:**
| `_id` | Status | `version` | `isCurrent` | `previousRecord` | `maritalStatus` |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `basic_001` | Historical | 1 | `false` | `null` | Single |
| `basic_002` | **Active** | **2** | **`true`** | **`basic_001`** | **Married** |

### D. DELETE (Soft-Delete Tombstone)
```javascript
const current = await EmployeeBasicInfo.findOne({ employeeId, isCurrent: true });

await EmployeeBasicInfo.findByIdAndUpdate(current._id, {
  $set: { isCurrent: false },
});

await EmployeeBasicInfo.create({
  ...current.toObject(),
  _id: undefined,
  version: current.version + 1,
  isCurrent: false,
  isDeleted: true,
  previousRecord: current._id,
  actionType: "DELETE",
  changedBy: req.employee._id,
});
```

### E. READ Audit History (Timeline)
```javascript
const timeline = await EmployeeBasicInfo.find({ employeeId }).sort({ version: -1 });
```

---

## 4. Case B: Multi-Entity Form CRUD (e.g., Languages, Education, Contacts)

An employee can have **multiple independent entries** (e.g., English, Urdu, German). Each entry has its own version lineage tracked via `rootRecordId`.

### A. CREATE (Add Language Item)
User adds "English":
```javascript
const newLang = new EmployeeLanguage({
  employeeId,
  language: "English",
  speakingLevel: "Average",
  canSpeak: true,
  version: 1,
  isCurrent: true,
  isDeleted: false,
  previousRecord: null,
  actionType: "CREATE",
  changedBy: req.employee._id,
});

// On initial creation, rootRecordId equals its own _id
newLang.rootRecordId = newLang._id;
await newLang.save();
```

User adds "Urdu":
```javascript
// Another independent document inserted with rootRecordId = self
```

**Database State:**
```json
// English (V1)
{
  "_id": "lang_001",
  "employeeId": "EMP_101",
  "rootRecordId": "lang_001",
  "language": "English",
  "speakingLevel": "Average",
  "version": 1,
  "isCurrent": true,
  "isDeleted": false
}

// Urdu (V1)
{
  "_id": "lang_002",
  "employeeId": "EMP_101",
  "rootRecordId": "lang_002",
  "language": "Urdu",
  "speakingLevel": "High",
  "version": 1,
  "isCurrent": true,
  "isDeleted": false
}
```

### B. READ Active Items (Frontend Grid / List)
```javascript
const activeLanguages = await EmployeeLanguage.find({
  employeeId,
  isCurrent: true,
  isDeleted: false,
});
// Returns array: [English (V1), Urdu (V1)]
```

### C. UPDATE (Single Item Versioned, Others Untouched)
User edits English to "High".
* **Urdu is 100% untouched** (zero write operations).
* English V1 is deactivated, English V2 is inserted:
```javascript
const currentItem = await EmployeeLanguage.findOne({
  _id: itemId, // lang_001
  employeeId,
  isCurrent: true,
});

if (!currentItem) throw new ApiError(404, "Item not found");

// 1. Deactivate old item
await EmployeeLanguage.findByIdAndUpdate(currentItem._id, {
  $set: { isCurrent: false },
});

// 2. Insert new item preserving rootRecordId
const updatedItem = await EmployeeLanguage.create({
  ...req.body,
  employeeId,
  rootRecordId: currentItem.rootRecordId, // Preserves "lang_001"
  version: currentItem.version + 1,
  isCurrent: true,
  isDeleted: false,
  previousRecord: currentItem._id,
  actionType: "UPDATE",
  changedBy: req.employee._id,
});
```

**Collection State After Update:**
| `_id` | `rootRecordId` | Language | Level | `version` | `isCurrent` | `previousRecord` | Status |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `lang_001` | `lang_001` | English | Average | 1 | `false` | `null` | Historical |
| **`lang_003`** | `lang_001` | **English** | **High** | **2** | **`true`** | **`lang_001`** | **Active** |
| **`lang_002`** | `lang_002` | **Urdu** | **High** | **1** | **`true`** | **`null`** | **Active** |

### D. DELETE (Single Item Removed)
User clicks "Delete" on Urdu:
```javascript
const currentItem = await EmployeeLanguage.findOne({
  _id: itemId, // lang_002
  employeeId,
  isCurrent: true,
});

await EmployeeLanguage.findByIdAndUpdate(currentItem._id, {
  $set: { isCurrent: false },
});

await EmployeeLanguage.create({
  ...currentItem.toObject(),
  _id: undefined,
  rootRecordId: currentItem.rootRecordId,
  version: currentItem.version + 1,
  isCurrent: false,
  isDeleted: true,
  previousRecord: currentItem._id,
  actionType: "DELETE",
  changedBy: req.employee._id,
});
```
* Querying active items (`isCurrent: true, isDeleted: false`) now returns **only English (`lang_003`)**.

### E. READ History
* **History of a single item (e.g., English only):**
  ```javascript
  const itemHistory = await EmployeeLanguage.find({
    rootRecordId: "lang_001"
  }).sort({ version: -1 });
  ```
* **Full chronological audit of all language actions for employee:**
  ```javascript
  const fullLog = await EmployeeLanguage.find({ employeeId }).sort({ createdAt: -1 });
  ```

---

## 5. MongoDB Partial Indexes for Big Data Scalability

To guarantee constant query speeds regardless of how many historical audit records accumulate, define partial unique indexes on every versioned collection:

```javascript
// Index only active records (ignores all historical versions)
schema.index(
  { employeeId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);

// For multi-entity collections: ensures fast root history lookup
schema.index({ rootRecordId: 1, version: -1 });
```
