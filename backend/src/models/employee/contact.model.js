import mongoose from "mongoose";
import { str, bool, enumStr, versioningHeader } from "../../utils/mongoose.js";

/**
 * =========================================================================
 * Employee Contact Model (Form 9 - Polymorphic Multi-Entity Collection)
 * =========================================================================
 * Supports 3 distinct contact categories under one SCD Type 2 versioned collection:
 * 1. SOCIAL_MEDIA (platform + value)
 * 2. EMERGENCY (office, permanent residence, present residence, mobile, other numbers)
 * 3. PHONE (isOfficial, isActive, contactNumber, phoneType [MOBILE, PTCL, VPTCL] + mobileDevice details)
 */
const employeeContactSchema = new mongoose.Schema(
  {
    // Primary Category Selector (Lookup: CONTACT_CATEGORY)
    // Values: "SOCIAL_MEDIA", "EMERGENCY", "PHONE"
    category: enumStr(["SOCIAL_MEDIA", "EMERGENCY", "PHONE"], true),

    // ----------------------------------------------------
    // Branch 1: SOCIAL_MEDIA
    // ----------------------------------------------------
    socialMedia: {
      platform: str(false, { uppercase: true }), // e.g. "EMAIL", "WHATSAPP", "FACEBOOK", "LINKEDIN", etc.
      value: str(false), // e.g. "user@example.com", profile URL, handle
    },

    // ----------------------------------------------------
    // Branch 2: EMERGENCY (At least 1 of 5 numbers required)
    // ----------------------------------------------------
    emergency: {
      officeNumber: str(false),
      permanentResidenceNumber: str(false),
      presentResidenceNumber: str(false),
      mobileNumber: str(false),
      otherNumber: str(false),
      contactPersonName: str(false),
      relation: str(false),
    },

    // ----------------------------------------------------
    // Branch 3: PHONE (Contact Number)
    // ----------------------------------------------------
    phone: {
      isOfficial: bool(true, false, { default: true }),
      isActive: bool(true, false, { default: true }),
      contactNumber: str(false),
      phoneType: str(false, { uppercase: true }), // "MOBILE", "PTCL", "VPTCL"
      // Mobile Device hardware details (enforced if phoneType === "MOBILE")
      mobileDevice: {
        setName: str(false),    // Required if phoneType === "MOBILE"
        imeiNumber: str(false), // Required if phoneType === "MOBILE"
        make: str(false),       // Optional
        modelType: str(false),  // Optional
      },
    },

    notes: str(false),

    // Audit & SCD Type 2 Multi-Entity Versioning Header
    ...versioningHeader("EmployeeContact"),
  },
  {
    timestamps: true,
  }
);

/**
 * =========================================
 * Indexes for Big Data Performance
 * =========================================
 */
// Fast active contacts retrieval for an employee
employeeContactSchema.index(
  { employeeId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);

// Fast category-filtered contacts retrieval
employeeContactSchema.index(
  { employeeId: 1, category: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);

// Fast chronological history retrieval for a single contact item (e.g. Item V1 -> V2)
employeeContactSchema.index({ rootRecordId: 1, version: -1 });

// Fast chronological audit timeline across all contacts for an employee
employeeContactSchema.index({ employeeId: 1, version: -1 });

const EmployeeContact = mongoose.model("EmployeeContact", employeeContactSchema);

export default EmployeeContact;
