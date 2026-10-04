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
    parameters: {
      pageParam: {
        name: "page",
        in: "query",
        description: "Page number (defaults to 1)",
        schema: { type: "integer", default: 1, minimum: 1 },
      },
      limitParam: {
        name: "limit",
        in: "query",
        description: "Number of records per page (default: 10, max: 100). Send 'all' to disable limit.",
        schema: { type: "string", default: "10" },
      },
      searchParam: {
        name: "search",
        in: "query",
        description: "Case-insensitive search query string",
        schema: { type: "string" },
      },
      searchFieldsParam: {
        name: "searchFields",
        in: "query",
        description: "Comma-separated list of fields to search across (e.g. 'name,notes')",
        schema: { type: "string" },
      },
      sortByParam: {
        name: "sortBy",
        in: "query",
        description: "Field name to sort results by (default: 'createdAt' or 'version')",
        schema: { type: "string" },
      },
      sortOrderParam: {
        name: "sortOrder",
        in: "query",
        description: "Sort direction ('asc' or 'desc', defaults to 'desc')",
        schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
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
    { name: "Employee - Addresses", description: "Form 10: Permanent & Present Residential Addresses (SCD Type 2 Versioned)" },
    { name: "Finance - Incomes", description: "Finance Module: Standalone Incomes Flow (Multi-Entity SCD2)" },
    { name: "Finance - Home Expenses", description: "Finance Module: Household & Domestic Expenses Flow (Multi-Entity SCD2)" },
    { name: "Finance - Other Expenses", description: "Finance Module: Miscellaneous & Other Expenses Flow (Multi-Entity SCD2)" },
    { name: "Finance - Summary", description: "Finance Module: Consolidated Financial Overview & Net Savings" },
    { name: "Family - Summary", description: "Family Module: Consolidated Dependents & Member Overview" },
    { name: "Family - Spouses", description: "Family Module: Multiple Spouses with CNIC, Passport & Education" },
    { name: "Family - Children", description: "Family Module: Multiple Children with B-Form, Education & Occupation" },
    { name: "Family - Parents", description: "Family Module: Multiple Fathers & Mothers with CNIC, Medical Category & Assets" },
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
        summary: "Register New Employee Account (Role + Assigned Number flow)",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["role", "assignedNumber", "password"],
                properties: {
                  role: {
                    type: "string",
                    enum: ["ADMIN", "TEACHER", "STAFF", "OTHER_STAFF"],
                    example: "TEACHER",
                    description: "Main employee category",
                  },
                  subCategory: {
                    type: "string",
                    enum: ["MONTESSORI", "PRIMARY", "MIDDLE", "HIGH", "COLLEGE"],
                    example: "PRIMARY",
                    description: "Required when role is TEACHER. Montessori, Primary, Middle, High, College.",
                  },
                  assignedNumber: {
                    type: "string",
                    example: "2001",
                    description: "Assigned employee / teacher / staff number",
                  },
                  email: {
                    type: "string",
                    example: "teacher.primary@school.edu",
                    description: "Employee email address (non-unique)",
                  },
                  password: {
                    type: "string",
                    example: "SecurePass123!",
                    description: "Password (min 8 characters)",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Employee registered successfully" },
          400: { description: "Validation error (e.g. missing subCategory for Teacher)" },
          409: { description: "Employee with this role/subCategory and assigned number already exists" },
        },
      },
    },

    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login Employee Account (Selector + Assigned Number + Password)",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["role", "assignedNumber", "password"],
                properties: {
                  role: {
                    type: "string",
                    enum: ["ADMIN", "TEACHER", "STAFF", "OTHER_STAFF"],
                    example: "TEACHER",
                    description: "Role selector (Admin, Teacher, Staff)",
                  },
                  subCategory: {
                    type: "string",
                    enum: ["MONTESSORI", "PRIMARY", "MIDDLE", "HIGH", "COLLEGE"],
                    example: "PRIMARY",
                    description: "Sub-category selector (Required for Teacher)",
                  },
                  assignedNumber: {
                    type: "string",
                    example: "2001",
                    description: "Assigned identification number",
                  },
                  password: {
                    type: "string",
                    example: "SecurePass123!",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful; cookies set & token returned" },
          400: { description: "Missing required role, subCategory or assignedNumber" },
          401: { description: "Invalid role, assigned number, or password" },
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
        summary: "Get Full SCD Type 2 Audit History for Basic Info (Paginated & Searchable)",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
          { $ref: "#/components/parameters/searchFieldsParam" },
          { $ref: "#/components/parameters/sortByParam" },
          { $ref: "#/components/parameters/sortOrderParam" },
        ],
        responses: {
          200: { description: "Chronological version history with pagination metadata" },
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
        summary: "Get Full SCD Type 2 Audit History for CNIC (Paginated & Searchable)",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
          { $ref: "#/components/parameters/searchFieldsParam" },
          { $ref: "#/components/parameters/sortByParam" },
          { $ref: "#/components/parameters/sortOrderParam" },
        ],
        responses: {
          200: { description: "CNIC version history with pagination metadata" },
        },
      },
    },

    // ----------------------------------------------------
    // EMPLOYEE: LANGUAGES (FORM 4 - MULTI-ENTITY)
    // ----------------------------------------------------
    "/api/v1/employee/languages": {
      get: {
        tags: ["Employee - Languages"],
        summary: "Get All Currently Active Languages for Authenticated Employee (Paginated & Searchable)",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
          { $ref: "#/components/parameters/searchFieldsParam" },
          { $ref: "#/components/parameters/sortByParam" },
          { $ref: "#/components/parameters/sortOrderParam" },
        ],
        responses: {
          200: { description: "Array of active languages with pagination metadata" },
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
        summary: "Get Version History for a Specific Language Item (e.g. English V1 -> V2) (Paginated & Searchable)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Language record _id",
          },
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
          { $ref: "#/components/parameters/searchFieldsParam" },
          { $ref: "#/components/parameters/sortByParam" },
          { $ref: "#/components/parameters/sortOrderParam" },
        ],
        responses: {
          200: { description: "Item audit timeline with pagination metadata" },
        },
      },
    },

    "/api/v1/employee/languages/history/all": {
      get: {
        tags: ["Employee - Languages"],
        summary: "Get Full Chronological Log of ALL Language Activities for Employee (Paginated & Searchable)",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
          { $ref: "#/components/parameters/searchFieldsParam" },
          { $ref: "#/components/parameters/sortByParam" },
          { $ref: "#/components/parameters/sortOrderParam" },
        ],
        responses: {
          200: { description: "Full chronological event stream with pagination metadata" },
        },
      },
    },

    // ----------------------------------------------------
    // EMPLOYEE: CONTACTS (FORM 9 - POLYMORPHIC MULTI-ENTITY)
    // ----------------------------------------------------
    "/api/v1/employee/contacts": {
      get: {
        tags: ["Employee - Contacts"],
        summary: "Get All Currently Active Contacts for Authenticated Employee (Paginated & Searchable)",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
          { $ref: "#/components/parameters/searchFieldsParam" },
          { $ref: "#/components/parameters/sortByParam" },
          { $ref: "#/components/parameters/sortOrderParam" },
        ],
        responses: {
          200: { description: "Array of active contacts (Social Media, Emergency, Phone) with pagination metadata" },
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
        summary: "Get Version History for a Specific Contact Item (e.g. Phone V1 -> V2) (Paginated & Searchable)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Contact record _id",
          },
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
          { $ref: "#/components/parameters/searchFieldsParam" },
          { $ref: "#/components/parameters/sortByParam" },
          { $ref: "#/components/parameters/sortOrderParam" },
        ],
        responses: {
          200: { description: "Contact item audit timeline with pagination metadata" },
        },
      },
    },

    "/api/v1/employee/contacts/history/all": {
      get: {
        tags: ["Employee - Contacts"],
        summary: "Get Full Chronological Log of ALL Contact Activities for Employee (Paginated & Searchable)",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
          { $ref: "#/components/parameters/searchFieldsParam" },
          { $ref: "#/components/parameters/sortByParam" },
          { $ref: "#/components/parameters/sortOrderParam" },
        ],
        responses: {
          200: { description: "Full chronological event stream with pagination metadata" },
        },
      },
    },

    // ----------------------------------------------------
    // EMPLOYEE: ADDRESSES (FORM 10 - PERMANENT & PRESENT)
    // ----------------------------------------------------
    "/api/v1/employee/addresses": {
      get: {
        tags: ["Employee - Addresses"],
        summary: "Get Both Active Permanent and Present Addresses in 1 Request (Form Load)",
        responses: {
          200: {
            description: "Object containing active permanent and present address records",
            content: {
              "application/json": {
                example: {
                  statusCode: 200,
                  data: {
                    permanent: {
                      addressLine: "House 45, Street 12, Sector B",
                      street: "Street 12",
                      postOffice: "Model Town Post Office",
                      landlineNumbers: ["042-35889901"],
                      place: {
                        country: "PK",
                        state: "PK_PUNJAB",
                        district: "LAHORE_DIST",
                        city: "LAHORE",
                        town: "MODEL_TOWN",
                        localityOrMuhalla: "Block B"
                      }
                    },
                    present: {
                      sameAsPermanent: true,
                      isForeignAddress: false,
                      addressLine: "House 45, Street 12, Sector B"
                    }
                  },
                  message: "Active addresses fetched successfully.",
                  success: true
                }
              }
            }
          },
        },
      },
    },

    "/api/v1/employee/addresses/permanent": {
      get: {
        tags: ["Employee - Addresses"],
        summary: "Get Current Active Permanent Address",
        responses: {
          200: { description: "Active permanent address details" },
        },
      },
      put: {
        tags: ["Employee - Addresses"],
        summary: "Save or Update Permanent Address (Triggers SCD Type 2 versioning)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  addressLine: { type: "string", example: "House 45, Street 12, Sector B" },
                  street: { type: "string", example: "Street 12" },
                  postOffice: { type: "string", example: "Model Town Post Office" },
                  landlineNumbers: {
                    type: "array",
                    items: { type: "string" },
                    example: ["042-35889901", "042-35889902"],
                  },
                  place: {
                    type: "object",
                    properties: {
                      country: { type: "string", example: "PK" },
                      state: { type: "string", example: "PK_PUNJAB" },
                      district: { type: "string", example: "LAHORE_DIST" },
                      city: { type: "string", example: "LAHORE" },
                      town: { type: "string", example: "MODEL_TOWN" },
                      localityOrMuhalla: { type: "string", example: "Block B" },
                    },
                  },
                  notes: { type: "string", example: "Verified from Utility Bill" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Permanent address version created/updated" },
        },
      },
    },

    "/api/v1/employee/addresses/permanent/history": {
      get: {
        tags: ["Employee - Addresses"],
        summary: "Get Full SCD Type 2 Audit History for Permanent Address (Paginated & Searchable)",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
          { $ref: "#/components/parameters/searchFieldsParam" },
          { $ref: "#/components/parameters/sortByParam" },
          { $ref: "#/components/parameters/sortOrderParam" },
        ],
        responses: {
          200: { description: "Permanent address version timeline with pagination metadata" },
        },
      },
    },

    "/api/v1/employee/addresses/present": {
      get: {
        tags: ["Employee - Addresses"],
        summary: "Get Current Active Present Address",
        responses: {
          200: { description: "Active present address details" },
        },
      },
      put: {
        tags: ["Employee - Addresses"],
        summary: "Save or Update Present Address (Handles sameAsPermanent & isForeignAddress)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sameAsPermanent: {
                    type: "boolean",
                    description: "If true, backend auto-copies fields from active Permanent Address",
                    example: false,
                  },
                  isForeignAddress: {
                    type: "boolean",
                    description: "If true, foreignAddress is required and local fields are ignored",
                    example: false,
                  },
                  addressLine: { type: "string", example: "Flat 4B, Gulberg Heights" },
                  street: { type: "string", example: "Main Boulevard" },
                  postOffice: { type: "string", example: "Gulberg Post Office" },
                  landlineNumbers: {
                    type: "array",
                    items: { type: "string" },
                    example: ["042-35750000"],
                  },
                  place: {
                    type: "object",
                    properties: {
                      country: { type: "string", example: "PK" },
                      state: { type: "string", example: "PK_PUNJAB" },
                      district: { type: "string", example: "LAHORE_DIST" },
                      city: { type: "string", example: "LAHORE" },
                      town: { type: "string", example: "GULBERG" },
                      localityOrMuhalla: { type: "string", example: "Block C3" },
                    },
                  },
                  foreignAddress: {
                    type: "string",
                    description: "Required when isForeignAddress is true",
                    example: "123 Business Bay, Tower 4, Dubai, UAE",
                  },
                  telegraphOffice: {
                    type: "string",
                    example: "Dubai Central Post",
                  },
                  notes: { type: "string", example: "Rental apartment near office" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Present address version created/updated" },
          400: { description: "Validation failure or Permanent address missing when sameAsPermanent is true" },
        },
      },
    },

    "/api/v1/employee/addresses/present/history": {
      get: {
        tags: ["Employee - Addresses"],
        summary: "Get Full SCD Type 2 Audit History for Present Address (Paginated & Searchable)",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
          { $ref: "#/components/parameters/searchFieldsParam" },
          { $ref: "#/components/parameters/sortByParam" },
          { $ref: "#/components/parameters/sortOrderParam" },
        ],
        responses: {
          200: { description: "Present address version timeline with pagination metadata" },
        },
      },
    },

    // ----------------------------------------------------
    // FINANCE MODULE - SUMMARY
    // ----------------------------------------------------
    "/api/v1/finance/summary": {
      get: {
        tags: ["Finance - Summary"],
        summary: "Get Consolidated Financial Health Summary (Income, Expenses, Net Savings)",
        parameters: [
          {
            name: "year",
            in: "query",
            description: "Optional financial year lookup code (e.g. 2024, 2025). Omit to aggregate all years.",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Aggregated financial overview with totals and record collections",
            content: {
              "application/json": {
                example: {
                  statusCode: 200,
                  data: {
                    year: "2024",
                    totalIncome: 210000,
                    totalExpenses: 97000,
                    totalHomeExpenses: 67000,
                    totalOtherExpenses: 30000,
                    netSavings: 113000,
                    counts: { incomes: 2, homeExpenses: 2, otherExpenses: 2, totalEntries: 6 },
                  },
                  message: "Finance summary retrieved successfully.",
                  success: true,
                },
              },
            },
          },
        },
      },
    },

    // ----------------------------------------------------
    // FINANCE MODULE - STANDALONE INCOMES
    // ----------------------------------------------------
    "/api/v1/finance/incomes": {
      get: {
        tags: ["Finance - Incomes"],
        summary: "Get All Active Incomes (Paginated & Searchable)",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
          { $ref: "#/components/parameters/searchFieldsParam" },
          { $ref: "#/components/parameters/sortByParam" },
          { $ref: "#/components/parameters/sortOrderParam" },
          {
            name: "year",
            in: "query",
            description: "Optional filter by financial year lookup code (e.g. 2024)",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Active income sources list with pagination metadata" },
        },
      },
      post: {
        tags: ["Finance - Incomes"],
        summary: "Add New Income Source",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "source", "year", "amount"],
                properties: {
                  title: { type: "string", example: "Monthly Base Salary" },
                  source: { type: "string", example: "Govt School Main Campus" },
                  year: { type: "string", example: "2024" },
                  amount: { type: "number", example: 150000 },
                  notes: { type: "string", example: "Regular faculty remuneration" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Income source created successfully" },
          400: { description: "Validation error" },
        },
      },
    },

    "/api/v1/finance/incomes/{id}": {
      put: {
        tags: ["Finance - Incomes"],
        summary: "Update Income Item (SCD Type 2 Versioned)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID of the income record to update",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "source", "year", "amount"],
                properties: {
                  title: { type: "string", example: "Monthly Base Salary" },
                  source: { type: "string", example: "Govt School Main Campus" },
                  year: { type: "string", example: "2024" },
                  amount: { type: "number", example: 165000 },
                  notes: { type: "string", example: "Annual salary increment" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Income item updated and new version created" },
          404: { description: "Income item not found" },
        },
      },
      delete: {
        tags: ["Finance - Incomes"],
        summary: "Soft-Delete Income Item (Tombstoned)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID of the income record to delete",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Income item removed successfully" },
          404: { description: "Income item not found" },
        },
      },
    },

    "/api/v1/finance/incomes/{id}/history": {
      get: {
        tags: ["Finance - Incomes"],
        summary: "Get Version History for an Income Item (Paginated)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID or Root ID of the income record",
            schema: { type: "string" },
          },
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
          { $ref: "#/components/parameters/sortByParam" },
          { $ref: "#/components/parameters/sortOrderParam" },
        ],
        responses: {
          200: { description: "Income item audit versions timeline" },
        },
      },
    },

    "/api/v1/finance/incomes/history/all": {
      get: {
        tags: ["Finance - Incomes"],
        summary: "Get Full Audit History for All Incomes (Paginated)",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
          { $ref: "#/components/parameters/sortByParam" },
          { $ref: "#/components/parameters/sortOrderParam" },
          {
            name: "year",
            in: "query",
            description: "Filter audit history by financial year",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Full chronological income audit log" },
        },
      },
    },

    // ----------------------------------------------------
    // FINANCE MODULE - HOME EXPENSES
    // ----------------------------------------------------
    "/api/v1/finance/expenses/home": {
      get: {
        tags: ["Finance - Home Expenses"],
        summary: "Get All Active Home Expenses (Paginated & Searchable)",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
          { $ref: "#/components/parameters/searchFieldsParam" },
          { $ref: "#/components/parameters/sortByParam" },
          { $ref: "#/components/parameters/sortOrderParam" },
          {
            name: "year",
            in: "query",
            description: "Optional filter by financial year lookup code (e.g. 2024)",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Active home expenses list" },
        },
      },
      post: {
        tags: ["Finance - Home Expenses"],
        summary: "Add New Home Expense",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["year", "title", "amount"],
                properties: {
                  year: { type: "string", example: "2024" },
                  title: { type: "string", example: "House Rent" },
                  amount: { type: "number", example: 40000 },
                  notes: { type: "string", example: "Monthly apartment lease" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Home expense created" },
          400: { description: "Validation error" },
        },
      },
    },

    "/api/v1/finance/expenses/home/{id}": {
      put: {
        tags: ["Finance - Home Expenses"],
        summary: "Update Home Expense (SCD Type 2 Versioned)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID of the home expense to update",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["year", "title", "amount"],
                properties: {
                  year: { type: "string", example: "2024" },
                  title: { type: "string", example: "House Rent" },
                  amount: { type: "number", example: 42000 },
                  notes: { type: "string", example: "Landlord revision" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Home expense updated" },
          404: { description: "Home expense not found" },
        },
      },
      delete: {
        tags: ["Finance - Home Expenses"],
        summary: "Soft-Delete Home Expense (Tombstoned)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID of the home expense to delete",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Home expense removed" },
          404: { description: "Home expense not found" },
        },
      },
    },

    "/api/v1/finance/expenses/home/{id}/history": {
      get: {
        tags: ["Finance - Home Expenses"],
        summary: "Get Version History for a Home Expense (Paginated)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
          { $ref: "#/components/parameters/sortByParam" },
          { $ref: "#/components/parameters/sortOrderParam" },
        ],
        responses: {
          200: { description: "Home expense audit versions timeline" },
        },
      },
    },

    "/api/v1/finance/expenses/home/history/all": {
      get: {
        tags: ["Finance - Home Expenses"],
        summary: "Get Full Audit History for All Home Expenses (Paginated)",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
          { $ref: "#/components/parameters/sortByParam" },
          { $ref: "#/components/parameters/sortOrderParam" },
          {
            name: "year",
            in: "query",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Full chronological home expenses audit history" },
        },
      },
    },

    // ----------------------------------------------------
    // FINANCE MODULE - OTHER EXPENSES
    // ----------------------------------------------------
    "/api/v1/finance/expenses/other": {
      get: {
        tags: ["Finance - Other Expenses"],
        summary: "Get All Active Other Expenses (Paginated & Searchable)",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
          { $ref: "#/components/parameters/searchFieldsParam" },
          { $ref: "#/components/parameters/sortByParam" },
          { $ref: "#/components/parameters/sortOrderParam" },
          {
            name: "year",
            in: "query",
            description: "Optional filter by financial year lookup code (e.g. 2024)",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Active other expenses list" },
        },
      },
      post: {
        tags: ["Finance - Other Expenses"],
        summary: "Add New Other Expense",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["year", "title", "amount"],
                properties: {
                  year: { type: "string", example: "2024" },
                  title: { type: "string", example: "Vehicle Fuel & Maintenance" },
                  amount: { type: "number", example: 18000 },
                  notes: { type: "string", example: "Fuel and maintenance" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Other expense created" },
          400: { description: "Validation error" },
        },
      },
    },

    "/api/v1/finance/expenses/other/{id}": {
      put: {
        tags: ["Finance - Other Expenses"],
        summary: "Update Other Expense (SCD Type 2 Versioned)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["year", "title", "amount"],
                properties: {
                  year: { type: "string", example: "2024" },
                  title: { type: "string", example: "Vehicle Fuel & Maintenance" },
                  amount: { type: "number", example: 20000 },
                  notes: { type: "string", example: "Major vehicle overhaul" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Other expense updated" },
          404: { description: "Other expense not found" },
        },
      },
      delete: {
        tags: ["Finance - Other Expenses"],
        summary: "Soft-Delete Other Expense (Tombstoned)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Other expense removed" },
          404: { description: "Other expense not found" },
        },
      },
    },

    "/api/v1/finance/expenses/other/{id}/history": {
      get: {
        tags: ["Finance - Other Expenses"],
        summary: "Get Version History for an Other Expense (Paginated)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
          { $ref: "#/components/parameters/sortByParam" },
          { $ref: "#/components/parameters/sortOrderParam" },
        ],
        responses: {
          200: { description: "Other expense audit versions timeline" },
        },
      },
    },

    "/api/v1/finance/expenses/other/history/all": {
      get: {
        tags: ["Finance - Other Expenses"],
        summary: "Get Full Audit History for All Other Expenses (Paginated)",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
          { $ref: "#/components/parameters/sortByParam" },
          { $ref: "#/components/parameters/sortOrderParam" },
          {
            name: "year",
            in: "query",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Full chronological other expenses audit history" },
        },
      },
    },

    // ----------------------------------------------------
    // FAMILY MODULE - SUMMARY
    // ----------------------------------------------------
    "/api/v1/family/summary": {
      get: {
        tags: ["Family - Summary"],
        summary: "Get Consolidated Family Summary & Dependents Count",
        responses: {
          200: {
            description: "Aggregated family members overview with counts and collections",
          },
        },
      },
    },

    // ----------------------------------------------------
    // FAMILY MODULE - SPOUSES
    // ----------------------------------------------------
    "/api/v1/family/spouses": {
      get: {
        tags: ["Family - Spouses"],
        summary: "Get All Active Spouses (Paginated & Searchable)",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
          { $ref: "#/components/parameters/searchFieldsParam" },
          { $ref: "#/components/parameters/sortByParam" },
          { $ref: "#/components/parameters/sortOrderParam" },
        ],
        responses: {
          200: { description: "List of active spouses with pagination metadata" },
        },
      },
      post: {
        tags: ["Family - Spouses"],
        summary: "Add New Spouse Profile",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Ayesha Khan" },
                  marriageDate: { type: "string", format: "date", example: "2015-06-20" },
                  status: { type: "string", example: "MARRIED" },
                  isAlive: { type: "boolean", example: true },
                  isDependent: { type: "boolean", example: true },
                  nationality: { type: "string", example: "PAKISTANI" },
                  notes: { type: "string", example: "First spouse" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Spouse profile created" },
        },
      },
    },

    "/api/v1/family/spouses/{id}": {
      put: {
        tags: ["Family - Spouses"],
        summary: "Update Spouse Profile (SCD Type 2 Versioned)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Ayesha Khan" },
                  marriageDate: { type: "string", format: "date", example: "2015-06-20" },
                  status: { type: "string", example: "MARRIED" },
                  isAlive: { type: "boolean", example: true },
                  isDependent: { type: "boolean", example: true },
                  notes: { type: "string", example: "Updated spouse details" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Spouse profile updated" },
        },
      },
      delete: {
        tags: ["Family - Spouses"],
        summary: "Soft-Delete Spouse Profile (Tombstoned)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Spouse profile removed" },
        },
      },
    },

    "/api/v1/family/spouses/{spouseId}/cnic": {
      get: {
        tags: ["Family - Spouses"],
        summary: "Get CNIC for a Specific Spouse",
        parameters: [
          { name: "spouseId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Spouse CNIC details" },
        },
      },
      post: {
        tags: ["Family - Spouses"],
        summary: "Save / Update CNIC for a Specific Spouse",
        parameters: [
          { name: "spouseId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["cnicNumber"],
                properties: {
                  cnicNumber: { type: "string", example: "35201-1234567-2" },
                  issueDate: { type: "string", format: "date", example: "2016-01-15" },
                  expiryDate: { type: "string", format: "date", example: "2026-01-15" },
                  familyNumber: { type: "string", example: "FAM-9988" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Spouse CNIC saved" },
        },
      },
      delete: {
        tags: ["Family - Spouses"],
        summary: "Soft-Delete Spouse CNIC",
        parameters: [
          { name: "spouseId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Spouse CNIC removed" },
        },
      },
    },

    "/api/v1/family/spouses/{spouseId}/passport": {
      get: {
        tags: ["Family - Spouses"],
        summary: "Get Passport for a Specific Spouse",
        parameters: [
          { name: "spouseId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Spouse passport details" },
        },
      },
      post: {
        tags: ["Family - Spouses"],
        summary: "Save / Update Passport for a Specific Spouse",
        parameters: [
          { name: "spouseId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["passportNumber"],
                properties: {
                  passportNumber: { type: "string", example: "PK78945612" },
                  country: { type: "string", example: "PAKISTAN" },
                  expiryDate: { type: "string", format: "date", example: "2030-05-20" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Spouse passport saved" },
        },
      },
      delete: {
        tags: ["Family - Spouses"],
        summary: "Soft-Delete Spouse Passport",
        parameters: [
          { name: "spouseId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Spouse passport removed" },
        },
      },
    },

    "/api/v1/family/spouses/{spouseId}/education": {
      get: {
        tags: ["Family - Spouses"],
        summary: "Get All Education Degrees for a Specific Spouse",
        parameters: [
          { name: "spouseId", in: "path", required: true, schema: { type: "string" } },
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
        ],
        responses: {
          200: { description: "Spouse education records" },
        },
      },
      post: {
        tags: ["Family - Spouses"],
        summary: "Add Education Degree for a Specific Spouse",
        parameters: [
          { name: "spouseId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["degreeLevel", "degreeName", "institute"],
                properties: {
                  degreeLevel: { type: "string", example: "MASTERS" },
                  degreeName: { type: "string", example: "M.Sc in Applied Psychology" },
                  institute: { type: "string", example: "Punjab University Lahore" },
                  passingYear: { type: "string", example: "2014" },
                  gradeOrGpa: { type: "string", example: "3.75 CGPA" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Spouse education degree created" },
        },
      },
    },

    "/api/v1/family/spouses/{spouseId}/education/{id}": {
      put: {
        tags: ["Family - Spouses"],
        summary: "Update Spouse Education Degree",
        parameters: [
          { name: "spouseId", in: "path", required: true, schema: { type: "string" } },
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Spouse education updated" },
        },
      },
      delete: {
        tags: ["Family - Spouses"],
        summary: "Delete Spouse Education Degree",
        parameters: [
          { name: "spouseId", in: "path", required: true, schema: { type: "string" } },
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Spouse education removed" },
        },
      },
    },

    // ----------------------------------------------------
    // FAMILY MODULE - CHILDREN
    // ----------------------------------------------------
    "/api/v1/family/children": {
      get: {
        tags: ["Family - Children"],
        summary: "Get All Active Children (Paginated & Searchable)",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
          { $ref: "#/components/parameters/searchFieldsParam" },
          { $ref: "#/components/parameters/sortByParam" },
          { $ref: "#/components/parameters/sortOrderParam" },
        ],
        responses: {
          200: { description: "Children list" },
        },
      },
      post: {
        tags: ["Family - Children"],
        summary: "Add New Child Profile",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "gender", "dateOfBirth"],
                properties: {
                  name: { type: "string", example: "Zainab Ali" },
                  gender: { type: "string", example: "FEMALE" },
                  dateOfBirth: { type: "string", format: "date", example: "2012-05-14" },
                  childType: { type: "string", example: "BIOLOGICAL" },
                  orderOfBirth: { type: "number", example: 1 },
                  isAlive: { type: "boolean", example: true },
                  isDependent: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Child created" },
        },
      },
    },

    "/api/v1/family/children/{id}": {
      put: {
        tags: ["Family - Children"],
        summary: "Update Child Profile",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Child profile updated" },
        },
      },
      delete: {
        tags: ["Family - Children"],
        summary: "Soft-Delete Child Profile",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Child profile removed" },
        },
      },
    },

    "/api/v1/family/children/{childId}/cnic": {
      get: {
        tags: ["Family - Children"],
        summary: "Get B-Form or CNIC for a Child",
        parameters: [
          { name: "childId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Child B-Form/CNIC details" },
        },
      },
      post: {
        tags: ["Family - Children"],
        summary: "Save / Update B-Form or CNIC for a Child",
        parameters: [
          { name: "childId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["idNumber"],
                properties: {
                  idType: { type: "string", enum: ["B_FORM", "CNIC"], example: "B_FORM" },
                  idNumber: { type: "string", example: "35201-9876543-2" },
                  familyNumber: { type: "string", example: "FAM-9988" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Child B-Form/CNIC saved" },
        },
      },
      delete: {
        tags: ["Family - Children"],
        summary: "Soft-Delete Child B-Form/CNIC",
        parameters: [
          { name: "childId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Child B-Form removed" },
        },
      },
    },

    "/api/v1/family/children/{childId}/education": {
      get: {
        tags: ["Family - Children"],
        summary: "Get School / College Records for a Child",
        parameters: [
          { name: "childId", in: "path", required: true, schema: { type: "string" } },
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
        ],
        responses: {
          200: { description: "Child education records" },
        },
      },
      post: {
        tags: ["Family - Children"],
        summary: "Add School / College Record for a Child",
        parameters: [
          { name: "childId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["institute", "currentClass"],
                properties: {
                  institute: { type: "string", example: "Beaconhouse School System" },
                  currentClass: { type: "string", example: "Grade 7" },
                  enrollmentStatus: { type: "string", example: "ENROLLED" },
                  boardOrUniversity: { type: "string", example: "FBISE Islamabad" },
                  isFeeReimbursable: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Child school record created" },
        },
      },
    },

    "/api/v1/family/children/{childId}/education/{id}": {
      put: {
        tags: ["Family - Children"],
        summary: "Update Child School Record",
        parameters: [
          { name: "childId", in: "path", required: true, schema: { type: "string" } },
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Child education updated" },
        },
      },
      delete: {
        tags: ["Family - Children"],
        summary: "Delete Child School Record",
        parameters: [
          { name: "childId", in: "path", required: true, schema: { type: "string" } },
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Child education removed" },
        },
      },
    },

    "/api/v1/family/children/{childId}/occupation": {
      get: {
        tags: ["Family - Children"],
        summary: "Get Occupation / Career Status for a Child",
        parameters: [
          { name: "childId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Child occupation status" },
        },
      },
      post: {
        tags: ["Family - Children"],
        summary: "Save / Update Occupation for a Child",
        parameters: [
          { name: "childId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", example: "STUDENT" },
                  organizationName: { type: "string", example: "Beaconhouse School System" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Child occupation saved" },
        },
      },
      delete: {
        tags: ["Family - Children"],
        summary: "Soft-Delete Child Occupation",
        parameters: [
          { name: "childId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Child occupation removed" },
        },
      },
    },

    // ----------------------------------------------------
    // FAMILY MODULE - PARENTS
    // ----------------------------------------------------
    "/api/v1/family/parents": {
      get: {
        tags: ["Family - Parents"],
        summary: "Get All Active Parents (Fathers & Mothers)",
        parameters: [
          {
            name: "parentType",
            in: "query",
            description: "Filter by parent type (FATHER or MOTHER)",
            schema: { type: "string", enum: ["FATHER", "MOTHER"] },
          },
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { $ref: "#/components/parameters/searchParam" },
        ],
        responses: {
          200: { description: "Parents list" },
        },
      },
      post: {
        tags: ["Family - Parents"],
        summary: "Add New Parent Profile (Biological, Adopted, Step)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "parentType"],
                properties: {
                  name: { type: "string", example: "Muhammad Ali" },
                  parentType: { type: "string", enum: ["FATHER", "MOTHER"], example: "FATHER" },
                  lineageType: { type: "string", enum: ["BIOLOGICAL", "ADOPTED", "STEP"], example: "BIOLOGICAL" },
                  isAlive: { type: "boolean", example: true },
                  isDependent: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Parent created" },
        },
      },
    },

    "/api/v1/family/parents/{id}": {
      put: {
        tags: ["Family - Parents"],
        summary: "Update Parent Profile",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Parent updated" },
        },
      },
      delete: {
        tags: ["Family - Parents"],
        summary: "Soft-Delete Parent Profile",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Parent removed" },
        },
      },
    },

    "/api/v1/family/parents/{parentId}/cnic": {
      get: {
        tags: ["Family - Parents"],
        summary: "Get Parent CNIC",
        parameters: [
          { name: "parentId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Parent CNIC details" },
        },
      },
      post: {
        tags: ["Family - Parents"],
        summary: "Save / Update Parent CNIC",
        parameters: [
          { name: "parentId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["cnicNumber"],
                properties: {
                  cnicNumber: { type: "string", example: "35201-5555555-1" },
                  familyNumber: { type: "string", example: "FAM-9988" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Parent CNIC saved" },
        },
      },
      delete: {
        tags: ["Family - Parents"],
        summary: "Soft-Delete Parent CNIC",
        parameters: [
          { name: "parentId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Parent CNIC removed" },
        },
      },
    },

    "/api/v1/family/parents/{parentId}/medical": {
      get: {
        tags: ["Family - Parents"],
        summary: "Get Parent Medical & Health Entitlement Details",
        parameters: [
          { name: "parentId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Parent medical details" },
        },
      },
      post: {
        tags: ["Family - Parents"],
        summary: "Save / Update Parent Medical Details",
        parameters: [
          { name: "parentId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  category: { type: "string", example: "CATEGORY_A" },
                  bloodGroup: { type: "string", example: "B_POS" },
                  hospitalRegistrationNumber: { type: "string", example: "HOSP-MED-4421" },
                  chronicIllness: { type: "string", example: "Hypertension, Mild Diabetes" },
                  specialCareInstructions: { type: "string", example: "Quarterly checkup" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Parent medical record saved" },
        },
      },
      delete: {
        tags: ["Family - Parents"],
        summary: "Soft-Delete Parent Medical Details",
        parameters: [
          { name: "parentId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Parent medical record removed" },
        },
      },
    },

    "/api/v1/family/parents/{parentId}/assets": {
      get: {
        tags: ["Family - Parents"],
        summary: "Get All Declared Assets for a Parent",
        parameters: [
          { name: "parentId", in: "path", required: true, schema: { type: "string" } },
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
        ],
        responses: {
          200: { description: "Parent assets list" },
        },
      },
      post: {
        tags: ["Family - Parents"],
        summary: "Add Declared Asset for a Parent",
        parameters: [
          { name: "parentId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["assetType", "title"],
                properties: {
                  assetType: { type: "string", example: "AGRICULTURAL_LAND" },
                  title: { type: "string", example: "10 Acres Cultivated Land" },
                  estimatedValue: { type: "number", example: 6500000 },
                  location: { type: "string", example: "District Kasur, Punjab" },
                  ownershipSharePercentage: { type: "number", example: 100 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Parent asset created" },
        },
      },
    },

    "/api/v1/family/parents/{parentId}/assets/{id}": {
      put: {
        tags: ["Family - Parents"],
        summary: "Update Declared Asset for a Parent",
        parameters: [
          { name: "parentId", in: "path", required: true, schema: { type: "string" } },
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Parent asset updated" },
        },
      },
      delete: {
        tags: ["Family - Parents"],
        summary: "Delete Declared Asset for a Parent",
        parameters: [
          { name: "parentId", in: "path", required: true, schema: { type: "string" } },
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Parent asset removed" },
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
