import swaggerUi from "swagger-ui-express";

export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Employee Management System (EMS) API",
    version: "1.0.0",
    description:
      "Enterprise Employee Management System API with SCD Type 2 Audit Trail and Centralized Dynamic Lookups.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local Development Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT access token (obtained from /api/v1/auth/login)",
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: "Auth", description: "Employee Authentication & Session Management" },
    { name: "Lookups", description: "Dynamic Master Data & Enum Dropdowns" },
    { name: "Employee - Basic Info", description: "Form 1: Basic Personal Profile (SCD Type 2 Versioned)" },
    { name: "Employee - CNIC", description: "Form 2: National Identity (SCD Type 2 Versioned)" },
    { name: "Employee - Languages", description: "Form 4: Language Proficiencies (Multi-Entity SCD2)" },
    { name: "Employee - Contacts", description: "Form 9: Polymorphic Contacts (Social Media, Emergency, Phone) (Multi-Entity SCD2)" },
    { name: "System Health", description: "API Status & Liveness" },
  ],
  paths: {
    // ----------------------------------------------------
    // SYSTEM HEALTH
    // ----------------------------------------------------
    "/api/health": {
      get: {
        tags: ["System Health"],
        summary: "Check API Health Status",
        security: [],
        responses: {
          200: {
            description: "API is active",
            content: {
              "application/json": {
                example: {
                  statusCode: 200,
                  data: null,
                  message: "API is running successfully 🚀",
                  success: true,
                },
              },
            },
          },
        },
      },
    },

    // ----------------------------------------------------
    // AUTHENTICATION
    // ----------------------------------------------------
    "/api/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register New Employee",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "employee@ems.com" },
                  password: { type: "string", example: "SecurePass123!" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Employee registered successfully" },
          409: { description: "Email already registered" },
        },
      },
    },

    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login Employee",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "employee@ems.com" },
                  password: { type: "string", example: "SecurePass123!" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful; cookies set & token returned" },
          401: { description: "Invalid credentials" },
        },
      },
    },

    "/api/v1/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get Authenticated Employee Profile",
        responses: {
          200: { description: "Current employee details fetched" },
          401: { description: "Unauthorized / Access token missing or expired" },
        },
      },
    },

    "/api/v1/auth/refresh-token": {
      post: {
        tags: ["Auth"],
        summary: "Rotate & Refresh Access Token",
        security: [],
        responses: {
          200: { description: "Tokens refreshed successfully" },
          401: { description: "Invalid or missing refresh token" },
        },
      },
    },

    "/api/v1/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout Employee (Clears DB session & cookies)",
        responses: {
          200: { description: "Logged out successfully" },
        },
      },
    },

    // ----------------------------------------------------
    // LOOKUPS (MASTER ENUMS)
    // ----------------------------------------------------
    "/api/v1/lookups": {
      get: {
        tags: ["Lookups"],
        summary: "Get Lookups by Category (Cascading parent support)",
        security: [],
        parameters: [
          {
            name: "category",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Category code (e.g. GENDER, MARITAL_STATUS, BLOOD_GROUP, CITY)",
            example: "GENDER",
          },
          {
            name: "parent",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Parent Lookup ObjectId OR parent code for cascading dropdowns (e.g. 'PK' for States, 'PUNJAB' for Districts, 'LAHORE_DIST' for Cities, 'LAHORE' for Towns)",
            example: "PK",
          },
          {
            name: "includeInactive",
            in: "query",
            required: false,
            schema: { type: "boolean" },
            description: "Set to true to include deactivated options",
          },
        ],
        responses: {
          200: { description: "List of matching lookups" },
        },
      },
      post: {
        tags: ["Lookups"],
        summary: "Create a Single Lookup Option",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["category", "code", "label"],
                properties: {
                  category: { type: "string", example: "GENDER" },
                  code: { type: "string", example: "NON_BINARY" },
                  label: { type: "string", example: "Non-Binary" },
                  sortOrder: { type: "number", example: 4 },
                  isActive: { type: "boolean", example: true },
                  parent: { type: "string", nullable: true, example: null },
                  metadata: { type: "object", example: {} },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Lookup created successfully" },
          409: { description: "Duplicate code in category" },
        },
      },
    },

    "/api/v1/lookups/bulk": {
      get: {
        tags: ["Lookups"],
        summary: "Fetch Multiple Dropdowns in 1 Single Request (Frontend Form Superpower)",
        security: [],
        parameters: [
          {
            name: "categories",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Comma-separated category codes",
            example: "GENDER,MARITAL_STATUS,BLOOD_GROUP,CONTACT_CATEGORY",
          },
        ],
        responses: {
          200: {
            description: "Dictionary grouped by category with active options",
            content: {
              "application/json": {
                example: {
                  statusCode: 200,
                  data: {
                    GENDER: [
                      { code: "MALE", label: "Male" },
                      { code: "FEMALE", label: "Female" },
                    ],
                    MARITAL_STATUS: [
                      { code: "SINGLE", label: "Single" },
                      { code: "MARRIED", label: "Married" },
                    ],
                  },
                  message: "Bulk lookups retrieved successfully.",
                  success: true,
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Lookups"],
        summary: "Bulk Create / Upsert Lookups",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["items"],
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["category", "code", "label"],
                      properties: {
                        category: { type: "string", example: "RELIGION" },
                        code: { type: "string", example: "ISLAM" },
                        label: { type: "string", example: "Islam" },
                        sortOrder: { type: "number", example: 1 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Bulk lookups processed" },
        },
      },
    },

    "/api/v1/lookups/categories": {
      get: {
        tags: ["Lookups"],
        summary: "List All Distinct Category Names",
        security: [],
        responses: {
          200: { description: "Array of category names" },
        },
      },
    },

    "/api/v1/lookups/{id}/toggle": {
      patch: {
        tags: ["Lookups"],
        summary: "Toggle Active/Inactive Status of a Lookup",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Lookup MongoDB _id",
          },
        ],
        responses: {
          200: { description: "Status toggled and cache refreshed" },
        },
      },
    },

    // ----------------------------------------------------
    // EMPLOYEE: BASIC INFO (FORM 1)
    // ----------------------------------------------------
    "/api/v1/employee/basic-info": {
      get: {
        tags: ["Employee - Basic Info"],
        summary: "Get Current Active Basic Info (Form Load)",
        responses: {
          200: { description: "Current active basic info record" },
          401: { description: "Unauthorized" },
        },
      },
      put: {
        tags: ["Employee - Basic Info"],
        summary: "Save or Update Basic Info (Triggers SCD2 Versioning)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fullName", "gender", "maritalStatus", "dateOfBirth"],
                properties: {
                  fullName: { type: "string", example: "Muhammad Ali" },
                  previousName: { type: "string", example: "" },
                  gender: { type: "string", example: "MALE" },
                  maritalStatus: { type: "string", example: "MARRIED" },
                  dateOfBirth: { type: "string", format: "date", example: "1995-05-12" },
                  placeOfBirth: {
                    type: "object",
                    properties: {
                      country: { type: "string", example: "PK" },
                      state: { type: "string", example: "PK_PUNJAB" },
                      district: { type: "string", example: "LAHORE_DIST" },
                      city: { type: "string", example: "LAHORE" },
                      town: { type: "string", example: "MODEL_TOWN" },
                      localityOrMuhalla: { type: "string", example: "House 12, Block B" },
                    },
                  },
                  notes: { type: "string", example: "Updated via Swagger UI" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Basic info version created/updated" },
          400: { description: "Zod or Lookup validation failure" },
        },
      },
    },

    "/api/v1/employee/basic-info/history": {
      get: {
        tags: ["Employee - Basic Info"],
        summary: "Get Full SCD Type 2 Audit History for Basic Info",
        responses: {
          200: { description: "Chronological version history" },
        },
      },
    },

    // ----------------------------------------------------
    // EMPLOYEE: CNIC (FORM 2)
    // ----------------------------------------------------
    "/api/v1/employee/cnic": {
      get: {
        tags: ["Employee - CNIC"],
        summary: "Get Current Active CNIC Record",
        responses: {
          200: { description: "Active CNIC data" },
        },
      },
      put: {
        tags: ["Employee - CNIC"],
        summary: "Save or Update CNIC (Triggers SCD2 Versioning)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["cnicNumber"],
                properties: {
                  cnicNumber: { type: "string", example: "35202-1234567-1" },
                  fatherOrHusbandName: { type: "string", example: "Tariq Mahmood" },
                  dateOfIssue: { type: "string", format: "date", example: "2015-08-10" },
                  issueCity: { type: "string", example: "LAHORE" },
                  identificationMark: { type: "string", example: "Mole on right arm" },
                  expiryDate: { type: "string", format: "date", example: "2025-08-10" },
                  notes: { type: "string", example: "Verified with NADRA" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "CNIC saved / versioned" },
          400: { description: "Validation failure" },
        },
      },
    },

    "/api/v1/employee/cnic/history": {
      get: {
        tags: ["Employee - CNIC"],
        summary: "Get Full SCD Type 2 Audit History for CNIC",
        responses: {
          200: { description: "CNIC version history" },
        },
      },
    },

    // ----------------------------------------------------
    // EMPLOYEE: LANGUAGES (FORM 4 - MULTI-ENTITY)
    // ----------------------------------------------------
    "/api/v1/employee/languages": {
      get: {
        tags: ["Employee - Languages"],
        summary: "Get All Currently Active Languages for Authenticated Employee",
        responses: {
          200: { description: "Array of active languages" },
        },
      },
      post: {
        tags: ["Employee - Languages"],
        summary: "Add a New Language Item",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "ENGLISH" },
                  canSpeak: { type: "boolean", example: true },
                  speakingLevel: { type: "string", example: "HIGH" },
                  canWrite: { type: "boolean", example: true },
                  writingLevel: { type: "string", example: "AVERAGE" },
                  canRead: { type: "boolean", example: true },
                  readingLevel: { type: "string", example: "HIGH" },
                  notes: { type: "string", example: "Primary business language" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Language item added (Version 1, rootRecordId initialized)" },
        },
      },
    },

    "/api/v1/employee/languages/{id}": {
      put: {
        tags: ["Employee - Languages"],
        summary: "Update Specific Language (Versions only this item, preserves others)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Language record _id",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "ENGLISH" },
                  canSpeak: { type: "boolean", example: true },
                  speakingLevel: { type: "string", example: "HIGH" },
                  canWrite: { type: "boolean", example: true },
                  writingLevel: { type: "string", example: "HIGH" },
                  canRead: { type: "boolean", example: true },
                  readingLevel: { type: "string", example: "HIGH" },
                  notes: { type: "string", example: "Upgraded proficiency" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Language item updated with new version" },
        },
      },
      delete: {
        tags: ["Employee - Languages"],
        summary: "Soft-Delete Specific Language (Inserts audit tombstone)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Language record _id",
          },
        ],
        responses: {
          200: { description: "Language soft-deleted successfully" },
        },
      },
    },

    "/api/v1/employee/languages/{id}/history": {
      get: {
        tags: ["Employee - Languages"],
        summary: "Get Version History for a Specific Language Item (e.g. English V1 -> V2)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Language record _id",
          },
        ],
        responses: {
          200: { description: "Item audit timeline" },
        },
      },
    },

    "/api/v1/employee/languages/history/all": {
      get: {
        tags: ["Employee - Languages"],
        summary: "Get Full Chronological Log of ALL Language Activities for Employee",
        responses: {
          200: { description: "Full chronological event stream" },
        },
      },
    },

    // ----------------------------------------------------
    // EMPLOYEE: CONTACTS (FORM 9 - POLYMORPHIC MULTI-ENTITY)
    // ----------------------------------------------------
    "/api/v1/employee/contacts": {
      get: {
        tags: ["Employee - Contacts"],
        summary: "Get All Currently Active Contacts for Authenticated Employee",
        responses: {
          200: { description: "Array of active contacts (Social Media, Emergency, Phone)" },
        },
      },
      post: {
        tags: ["Employee - Contacts"],
        summary: "Add a New Contact Record (Social Media, Emergency Contact, or Phone with IMEI)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["category"],
                properties: {
                  category: {
                    type: "string",
                    enum: ["SOCIAL_MEDIA", "EMERGENCY", "PHONE"],
                    example: "PHONE",
                  },
                  socialMedia: {
                    type: "object",
                    properties: {
                      platform: { type: "string", example: "WHATSAPP" },
                      value: { type: "string", example: "+923001234567" },
                    },
                  },
                  emergency: {
                    type: "object",
                    description: "At least 1 of the 5 contact numbers is required",
                    properties: {
                      officeNumber: { type: "string", example: "042-35889901" },
                      permanentResidenceNumber: { type: "string", example: "042-35889902" },
                      presentResidenceNumber: { type: "string", example: "042-35889903" },
                      mobileNumber: { type: "string", example: "0300-1234567" },
                      otherNumber: { type: "string", example: "0321-7654321" },
                      contactPersonName: { type: "string", example: "Tariq Mahmood" },
                      relation: { type: "string", example: "Brother" },
                    },
                  },
                  phone: {
                    type: "object",
                    properties: {
                      isOfficial: { type: "boolean", example: true },
                      isActive: { type: "boolean", example: true },
                      contactNumber: { type: "string", example: "0300-9876543" },
                      phoneType: { type: "string", enum: ["MOBILE", "PTCL", "VPTCL"], example: "MOBILE" },
                      mobileDevice: {
                        type: "object",
                        description: "Required when phoneType is MOBILE",
                        properties: {
                          setName: { type: "string", example: "iPhone 15 Pro" },
                          imeiNumber: { type: "string", example: "356938035643809" },
                          make: { type: "string", example: "Apple" },
                          modelType: { type: "string", example: "A3106" },
                        },
                      },
                    },
                  },
                  notes: { type: "string", example: "Primary corporate mobile line" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Contact record created (Version 1, rootRecordId initialized)" },
          400: { description: "Validation failure (Zod / Lookup)" },
        },
      },
    },

    "/api/v1/employee/contacts/{id}": {
      put: {
        tags: ["Employee - Contacts"],
        summary: "Update Specific Contact (Triggers SCD Type 2 audit versioning)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Contact record _id",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["category"],
                properties: {
                  category: { type: "string", enum: ["SOCIAL_MEDIA", "EMERGENCY", "PHONE"], example: "PHONE" },
                  phone: {
                    type: "object",
                    properties: {
                      isOfficial: { type: "boolean", example: true },
                      isActive: { type: "boolean", example: true },
                      contactNumber: { type: "string", example: "0300-9999999" },
                      phoneType: { type: "string", example: "MOBILE" },
                      mobileDevice: {
                        type: "object",
                        properties: {
                          setName: { type: "string", example: "iPhone 16 Pro" },
                          imeiNumber: { type: "string", example: "356938039999999" },
                          make: { type: "string", example: "Apple" },
                          modelType: { type: "string", example: "A3200" },
                        },
                      },
                    },
                  },
                  notes: { type: "string", example: "Upgraded device to iPhone 16 Pro" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Contact updated with new version" },
        },
      },
      delete: {
        tags: ["Employee - Contacts"],
        summary: "Soft-Delete Specific Contact (Inserts audit tombstone)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Contact record _id",
          },
        ],
        responses: {
          200: { description: "Contact soft-deleted successfully" },
        },
      },
    },

    "/api/v1/employee/contacts/{id}/history": {
      get: {
        tags: ["Employee - Contacts"],
        summary: "Get Version History for a Specific Contact Item (e.g. Phone V1 -> V2)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Contact record _id",
          },
        ],
        responses: {
          200: { description: "Contact item audit timeline" },
        },
      },
    },

    "/api/v1/employee/contacts/history/all": {
      get: {
        tags: ["Employee - Contacts"],
        summary: "Get Full Chronological Log of ALL Contact Activities for Employee",
        responses: {
          200: { description: "Full chronological event stream" },
        },
      },
    },
  },
};

export const serveSwagger = swaggerUi.serve;
export const setupSwagger = swaggerUi.setup(swaggerDocument, {
  swaggerOptions: {
    persistAuthorization: true,
    withCredentials: true,
  },
  customSiteTitle: "EMS API Documentation",
});

export default {
  swaggerDocument,
  serveSwagger,
  setupSwagger,
};
