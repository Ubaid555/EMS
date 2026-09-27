import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { BCRYPT_SALT_ROUNDS } from "../../utils/constants.js";
import env from "../../config/env.config.js";

const employeeSchema = new mongoose.Schema(
  {
    credentials: {
      role: {
        type: String,
        required: [true, "Role is required."],
        enum: {
          values: ["ADMIN", "TEACHER", "STAFF", "OTHER_STAFF"],
          message: "Role must be ADMIN, TEACHER, or STAFF.",
        },
        uppercase: true,
        trim: true,
      },
      subCategory: {
        type: String,
        enum: {
          values: ["MONTESSORI", "PRIMARY", "MIDDLE", "HIGH", "COLLEGE", null],
          message:
            "Sub-category for teacher must be MONTESSORI, PRIMARY, MIDDLE, HIGH, or COLLEGE.",
        },
        default: null,
        uppercase: true,
        trim: true,
      },
      assignedNumber: {
        type: String,
        required: [true, "Assigned number is required."],
        trim: true,
      },
      email: {
        type: String,
        required: false,
        lowercase: true,
        trim: true,
        default: "",
      },
      password: {
        type: String,
        required: [true, "Password is required."],
        minlength: [8, "Password must be at least 8 characters."],
        select: false,
      },
    },

    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * =========================================================================
 * Normalization & Validation Hook
 * =========================================================================
 */
employeeSchema.pre("validate", function () {
  if (this.credentials) {
    // Normalize OTHER_STAFF to STAFF
    if (this.credentials.role === "OTHER_STAFF") {
      this.credentials.role = "STAFF";
    }

    // Normalize spelling variant MONTESSORY -> MONTESSORI
    if (this.credentials.subCategory === "MONTESSORY") {
      this.credentials.subCategory = "MONTESSORI";
    }

    // Teacher role strictly requires a subCategory
    if (this.credentials.role === "TEACHER") {
      if (!this.credentials.subCategory) {
        this.invalidate(
          "credentials.subCategory",
          "Sub-category is required for Teacher (MONTESSORI, PRIMARY, MIDDLE, HIGH, COLLEGE)."
        );
      }
    } else {
      // Non-teacher accounts (Admin, Staff) don't have sub-categories
      this.credentials.subCategory = null;
    }
  }
});

/**
 * =========================================================================
 * Compound Unique Index for Education EMS
 * =========================================================================
 * Guarantees uniqueness for (role + subCategory + assignedNumber).
 * E.g.:
 * - (ADMIN, null, 101) is unique
 * - (STAFF, null, 101) is unique
 * - (TEACHER, PRIMARY, 101) is unique
 * - (TEACHER, HIGH, 101) is unique
 */
employeeSchema.index(
  {
    "credentials.role": 1,
    "credentials.subCategory": 1,
    "credentials.assignedNumber": 1,
  },
  { unique: true }
);

/**
 * =========================================
 * Hash Password Before Saving
 * =========================================
 */
employeeSchema.pre("save", async function () {
  if (!this.isModified("credentials.password")) {
    return;
  }

  this.credentials.password = await bcrypt.hash(
    this.credentials.password,
    BCRYPT_SALT_ROUNDS
  );
});

/**
 * =========================================
 * Compare Password Method
 * =========================================
 */
employeeSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.credentials.password);
};

/**
 * =========================================
 * Generate Access Token
 * =========================================
 */
employeeSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      employeeId: this._id,
    },
    env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: env.ACCESS_TOKEN_EXPIRES,
    }
  );
};

/**
 * =========================================
 * Generate Refresh Token
 * =========================================
 */
employeeSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      employeeId: this._id,
    },
    env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: env.REFRESH_TOKEN_EXPIRES,
    }
  );
};

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
