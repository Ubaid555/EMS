import { z } from "zod";
import { lookupCodeValidator } from "../common.validator.js";

/**
 * =========================================================================
 * Employee Contact Zod Validator (Form 9 - Polymorphic Multi-Entity)
 * =========================================================================
 * Branch 1: SOCIAL_MEDIA -> platform & value required
 * Branch 2: EMERGENCY -> at least 1 of 5 numbers required
 * Branch 3: PHONE -> contactNumber & phoneType required.
 *                    If MOBILE: setName & imeiNumber required.
 */
export const contactSchema = z
  .object({
    category: z.enum(["SOCIAL_MEDIA", "EMERGENCY", "PHONE"], {
      required_error: "Contact category is required (SOCIAL_MEDIA, EMERGENCY, or PHONE).",
      invalid_type_error: "Invalid category. Must be SOCIAL_MEDIA, EMERGENCY, or PHONE.",
    }),

    // Branch 1: Social Media
    socialMedia: z
      .object({
        platform: z.string().trim().toUpperCase().optional(),
        value: z.string().trim().optional(),
      })
      .optional(),

    // Branch 2: Emergency Contact
    emergency: z
      .object({
        officeNumber: z.string().trim().optional(),
        permanentResidenceNumber: z.string().trim().optional(),
        presentResidenceNumber: z.string().trim().optional(),
        mobileNumber: z.string().trim().optional(),
        otherNumber: z.string().trim().optional(),
        contactPersonName: z.string().trim().optional(),
        relation: z.string().trim().optional(),
      })
      .optional(),

    // Branch 3: Phone (Contact Number)
    phone: z
      .object({
        isOfficial: z.boolean().optional().default(true),
        isActive: z.boolean().optional().default(true),
        contactNumber: z.string().trim().optional(),
        phoneType: z.string().trim().toUpperCase().optional(),
        mobileDevice: z
          .object({
            setName: z.string().trim().optional(),
            imeiNumber: z.string().trim().optional(),
            make: z.string().trim().optional(),
            modelType: z.string().trim().optional(),
          })
          .optional(),
      })
      .optional(),

    notes: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    // ----------------------------------------------------
    // Branch 1: SOCIAL_MEDIA Validation
    // ----------------------------------------------------
    if (data.category === "SOCIAL_MEDIA") {
      if (!data.socialMedia) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["socialMedia"],
          message: "Social media object is required when category is SOCIAL_MEDIA.",
        });
        return;
      }

      if (!data.socialMedia.platform) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["socialMedia", "platform"],
          message: "Social platform (e.g. EMAIL, WHATSAPP, FACEBOOK, LINKEDIN) is required.",
        });
      }

      if (!data.socialMedia.value || data.socialMedia.value.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["socialMedia", "value"],
          message: "Social media value (email, handle, URL, or number) is required.",
        });
      }
    }

    // ----------------------------------------------------
    // Branch 2: EMERGENCY Validation (At least 1 of 5 numbers)
    // ----------------------------------------------------
    if (data.category === "EMERGENCY") {
      if (!data.emergency) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["emergency"],
          message: "Emergency contact object is required when category is EMERGENCY.",
        });
        return;
      }

      const hasAtLeastOneNumber =
        Boolean(data.emergency.officeNumber) ||
        Boolean(data.emergency.permanentResidenceNumber) ||
        Boolean(data.emergency.presentResidenceNumber) ||
        Boolean(data.emergency.mobileNumber) ||
        Boolean(data.emergency.otherNumber);

      if (!hasAtLeastOneNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["emergency"],
          message:
            "At least one contact number is required for emergency contact (office, permanent residence, present residence, mobile, or other number).",
        });
      }
    }

    // ----------------------------------------------------
    // Branch 3: PHONE Validation
    // ----------------------------------------------------
    if (data.category === "PHONE") {
      if (!data.phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone"],
          message: "Phone details object is required when category is PHONE.",
        });
        return;
      }

      if (!data.phone.contactNumber || data.phone.contactNumber.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone", "contactNumber"],
          message: "Contact number is required.",
        });
      }

      if (!data.phone.phoneType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone", "phoneType"],
          message: "Phone type is required (MOBILE, PTCL, or VPTCL).",
        });
      } else if (!["MOBILE", "PTCL", "VPTCL"].includes(data.phone.phoneType)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone", "phoneType"],
          message: `Invalid phone type '${data.phone.phoneType}'. Valid options are: MOBILE, PTCL, VPTCL.`,
        });
      }

      // If Mobile, enforce device hardware info
      if (data.phone.phoneType === "MOBILE") {
        if (!data.phone.mobileDevice) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["phone", "mobileDevice"],
            message: "Mobile device details (setName and imeiNumber) are required when phone type is MOBILE.",
          });
          return;
        }

        if (!data.phone.mobileDevice.setName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["phone", "mobileDevice", "setName"],
            message: "Mobile set name is required (e.g. 'iPhone 15 Pro', 'Samsung S24').",
          });
        }

        if (!data.phone.mobileDevice.imeiNumber) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["phone", "mobileDevice", "imeiNumber"],
            message: "IMEI number is required for mobile phones.",
          });
        }
      }
    }
  });

export default contactSchema;
