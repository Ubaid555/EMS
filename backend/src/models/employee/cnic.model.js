import mongoose from "mongoose";
import { str, date, versioningHeader } from "../../utils/mongoose.js";
import { baseCnicFields } from "../common/index.js";

const employeeCnicSchema = new mongoose.Schema(
  {
    // Reusable CNIC fields (shared with Family Relations)
    ...baseCnicFields(),

    // Fields limited strictly to Employee Personal
    identificationMark: str(false),
    expiryDate: date(false),

    // Audit & SCD Type 2 Versioning Header
    ...versioningHeader("EmployeeCnic"),
  },
  {
    timestamps: true,
  }
);

/**
 * =========================================
 * Indexes for Blazing Big Data Performance
 * =========================================
 */
// Ensure no two active employees have the same CNIC
employeeCnicSchema.index(
  { cnicNumber: 1, isCurrent: 1 },
  { unique: true, partialFilterExpression: { isCurrent: true, isDeleted: false } }
);

// Fast active record retrieval for frontend form load
employeeCnicSchema.index(
  { employeeId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);

// Fast chronological audit history retrieval
employeeCnicSchema.index({ employeeId: 1, version: -1 });

const EmployeeCnic = mongoose.model("EmployeeCnic", employeeCnicSchema);

export default EmployeeCnic;
