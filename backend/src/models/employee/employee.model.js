import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { BCRYPT_SALT_ROUNDS } from "../../utils/constants.js";
import env from "../../config/env.config.js";

const employeeSchema = new mongoose.Schema(
  {
    credentials: {
      email: {
        type: String,
        required: [true, "Email is required."],
        unique: true,
        lowercase: true,
        trim: true,
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
