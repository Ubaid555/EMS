/**
 * =========================================
 * Master Geographic Lookup Dataset
 * Cascading hierarchy:
 * COUNTRY -> STATE -> DISTRICT -> CITY -> TOWN
 * =========================================
 */

export const geoCountries = [
  { category: "COUNTRY", code: "PK", label: "Pakistan", sortOrder: 1 },
  { category: "COUNTRY", code: "AE", label: "United Arab Emirates", sortOrder: 2 },
  { category: "COUNTRY", code: "SA", label: "Saudi Arabia", sortOrder: 3 },
  { category: "COUNTRY", code: "GB", label: "United Kingdom", sortOrder: 4 },
  { category: "COUNTRY", code: "US", label: "United States", sortOrder: 5 },
  { category: "COUNTRY", code: "CA", label: "Canada", sortOrder: 6 },
  { category: "COUNTRY", code: "AU", label: "Australia", sortOrder: 7 },
  { category: "COUNTRY", code: "CN", label: "China", sortOrder: 8 },
  { category: "COUNTRY", code: "TR", label: "Turkey", sortOrder: 9 },
  { category: "COUNTRY", code: "DE", label: "Germany", sortOrder: 10 },
  { category: "COUNTRY", code: "MY", label: "Malaysia", sortOrder: 11 },
  { category: "COUNTRY", code: "QA", label: "Qatar", sortOrder: 12 },
  { category: "COUNTRY", code: "OM", label: "Oman", sortOrder: 13 },
];

export const geoStates = [
  { category: "STATE", code: "PK_PUNJAB", label: "Punjab", parentCode: "PK", sortOrder: 1 },
  { category: "STATE", code: "PK_SINDH", label: "Sindh", parentCode: "PK", sortOrder: 2 },
  { category: "STATE", code: "PK_KPK", label: "Khyber Pakhtunkhwa", parentCode: "PK", sortOrder: 3 },
  { category: "STATE", code: "PK_BALOCHISTAN", label: "Balochistan", parentCode: "PK", sortOrder: 4 },
  { category: "STATE", code: "PK_ISLAMABAD", label: "Islamabad Capital Territory", parentCode: "PK", sortOrder: 5 },
  { category: "STATE", code: "PK_AJK", label: "Azad Jammu & Kashmir", parentCode: "PK", sortOrder: 6 },
  { category: "STATE", code: "PK_GILGIT_BALTISTAN", label: "Gilgit-Baltistan", parentCode: "PK", sortOrder: 7 },
];

export const geoDistricts = [
  // Punjab Districts
  { category: "DISTRICT", code: "LAHORE_DIST", label: "Lahore District", parentCode: "PK_PUNJAB", sortOrder: 1 },
  { category: "DISTRICT", code: "RAWALPINDI_DIST", label: "Rawalpindi District", parentCode: "PK_PUNJAB", sortOrder: 2 },
  { category: "DISTRICT", code: "FAISALABAD_DIST", label: "Faisalabad District", parentCode: "PK_PUNJAB", sortOrder: 3 },
  { category: "DISTRICT", code: "MULTAN_DIST", label: "Multan District", parentCode: "PK_PUNJAB", sortOrder: 4 },
  { category: "DISTRICT", code: "GUJRANWALA_DIST", label: "Gujranwala District", parentCode: "PK_PUNJAB", sortOrder: 5 },
  { category: "DISTRICT", code: "SIALKOT_DIST", label: "Sialkot District", parentCode: "PK_PUNJAB", sortOrder: 6 },
  { category: "DISTRICT", code: "BAHAWALPUR_DIST", label: "Bahawalpur District", parentCode: "PK_PUNJAB", sortOrder: 7 },
  { category: "DISTRICT", code: "SARGODHA_DIST", label: "Sargodha District", parentCode: "PK_PUNJAB", sortOrder: 8 },
  { category: "DISTRICT", code: "SHEIKHUPURA_DIST", label: "Sheikhupura District", parentCode: "PK_PUNJAB", sortOrder: 9 },
  { category: "DISTRICT", code: "GUJRAT_DIST", label: "Gujrat District", parentCode: "PK_PUNJAB", sortOrder: 10 },
  { category: "DISTRICT", code: "SAHIWAL_DIST", label: "Sahiwal District", parentCode: "PK_PUNJAB", sortOrder: 11 },
  { category: "DISTRICT", code: "RAHIM_YAR_KHAN_DIST", label: "Rahim Yar Khan District", parentCode: "PK_PUNJAB", sortOrder: 12 },
  { category: "DISTRICT", code: "KASUR_DIST", label: "Kasur District", parentCode: "PK_PUNJAB", sortOrder: 13 },
  { category: "DISTRICT", code: "JHANG_DIST", label: "Jhang District", parentCode: "PK_PUNJAB", sortOrder: 14 },
  { category: "DISTRICT", code: "ATTOCK_DIST", label: "Attock District", parentCode: "PK_PUNJAB", sortOrder: 15 },
  { category: "DISTRICT", code: "CHAKWAL_DIST", label: "Chakwal District", parentCode: "PK_PUNJAB", sortOrder: 16 },
  { category: "DISTRICT", code: "JHELUM_DIST", label: "Jhelum District", parentCode: "PK_PUNJAB", sortOrder: 17 },

  // Sindh Districts
  { category: "DISTRICT", code: "KARACHI_CENTRAL_DIST", label: "Karachi Central District", parentCode: "PK_SINDH", sortOrder: 1 },
  { category: "DISTRICT", code: "KARACHI_EAST_DIST", label: "Karachi East District", parentCode: "PK_SINDH", sortOrder: 2 },
  { category: "DISTRICT", code: "KARACHI_SOUTH_DIST", label: "Karachi South District", parentCode: "PK_SINDH", sortOrder: 3 },
  { category: "DISTRICT", code: "KARACHI_WEST_DIST", label: "Karachi West District", parentCode: "PK_SINDH", sortOrder: 4 },
  { category: "DISTRICT", code: "KORANGI_DIST", label: "Korangi District", parentCode: "PK_SINDH", sortOrder: 5 },
  { category: "DISTRICT", code: "MALIR_DIST", label: "Malir District", parentCode: "PK_SINDH", sortOrder: 6 },
  { category: "DISTRICT", code: "HYDERABAD_DIST", label: "Hyderabad District", parentCode: "PK_SINDH", sortOrder: 7 },
  { category: "DISTRICT", code: "SUKKUR_DIST", label: "Sukkur District", parentCode: "PK_SINDH", sortOrder: 8 },
  { category: "DISTRICT", code: "LARKANA_DIST", label: "Larkana District", parentCode: "PK_SINDH", sortOrder: 9 },

  // KPK Districts
  { category: "DISTRICT", code: "PESHAWAR_DIST", label: "Peshawar District", parentCode: "PK_KPK", sortOrder: 1 },
  { category: "DISTRICT", code: "ABBOTTABAD_DIST", label: "Abbottabad District", parentCode: "PK_KPK", sortOrder: 2 },
  { category: "DISTRICT", code: "MARDAN_DIST", label: "Mardan District", parentCode: "PK_KPK", sortOrder: 3 },
  { category: "DISTRICT", code: "SWAT_DIST", label: "Swat District", parentCode: "PK_KPK", sortOrder: 4 },
  { category: "DISTRICT", code: "NOWSHERA_DIST", label: "Nowshera District", parentCode: "PK_KPK", sortOrder: 5 },
  { category: "DISTRICT", code: "MANSEHRA_DIST", label: "Mansehra District", parentCode: "PK_KPK", sortOrder: 6 },
  { category: "DISTRICT", code: "DERA_ISMAIL_KHAN_DIST", label: "Dera Ismail Khan District", parentCode: "PK_KPK", sortOrder: 7 },

  // Balochistan Districts
  { category: "DISTRICT", code: "QUETTA_DIST", label: "Quetta District", parentCode: "PK_BALOCHISTAN", sortOrder: 1 },
  { category: "DISTRICT", code: "GWADAR_DIST", label: "Gwadar District", parentCode: "PK_BALOCHISTAN", sortOrder: 2 },
  { category: "DISTRICT", code: "KHUZDAR_DIST", label: "Khuzdar District", parentCode: "PK_BALOCHISTAN", sortOrder: 3 },

  // Islamabad District
  { category: "DISTRICT", code: "ISLAMABAD_DIST", label: "Islamabad District", parentCode: "PK_ISLAMABAD", sortOrder: 1 },

  // AJK Districts
  { category: "DISTRICT", code: "MUZAFFARABAD_DIST", label: "Muzaffarabad District", parentCode: "PK_AJK", sortOrder: 1 },
  { category: "DISTRICT", code: "MIRPUR_AJK_DIST", label: "Mirpur District", parentCode: "PK_AJK", sortOrder: 2 },

  // Gilgit-Baltistan Districts
  { category: "DISTRICT", code: "GILGIT_DIST", label: "Gilgit District", parentCode: "PK_GILGIT_BALTISTAN", sortOrder: 1 },
  { category: "DISTRICT", code: "SKARDU_DIST", label: "Skardu District", parentCode: "PK_GILGIT_BALTISTAN", sortOrder: 2 },
];

export const geoCities = [
  // Punjab Cities
  { category: "CITY", code: "LAHORE", label: "Lahore", parentCode: "LAHORE_DIST", sortOrder: 1 },
  { category: "CITY", code: "RAWALPINDI", label: "Rawalpindi", parentCode: "RAWALPINDI_DIST", sortOrder: 2 },
  { category: "CITY", code: "GUJAR_KHAN", label: "Gujar Khan", parentCode: "RAWALPINDI_DIST", sortOrder: 3 },
  { category: "CITY", code: "MURREE", label: "Murree", parentCode: "RAWALPINDI_DIST", sortOrder: 4 },
  { category: "CITY", code: "FAISALABAD", label: "Faisalabad", parentCode: "FAISALABAD_DIST", sortOrder: 5 },
  { category: "CITY", code: "JARANWALA", label: "Jaranwala", parentCode: "FAISALABAD_DIST", sortOrder: 6 },
  { category: "CITY", code: "MULTAN", label: "Multan", parentCode: "MULTAN_DIST", sortOrder: 7 },
  { category: "CITY", code: "SHUJABAD", label: "Shujabad", parentCode: "MULTAN_DIST", sortOrder: 8 },
  { category: "CITY", code: "GUJRANWALA", label: "Gujranwala", parentCode: "GUJRANWALA_DIST", sortOrder: 9 },
  { category: "CITY", code: "KAMOKE", label: "Kamoke", parentCode: "GUJRANWALA_DIST", sortOrder: 10 },
  { category: "CITY", code: "SIALKOT", label: "Sialkot", parentCode: "SIALKOT_DIST", sortOrder: 11 },
  { category: "CITY", code: "DASKA", label: "Daska", parentCode: "SIALKOT_DIST", sortOrder: 12 },
  { category: "CITY", code: "BAHAWALPUR", label: "Bahawalpur", parentCode: "BAHAWALPUR_DIST", sortOrder: 13 },
  { category: "CITY", code: "AHMEDPUR_EAST", label: "Ahmedpur East", parentCode: "BAHAWALPUR_DIST", sortOrder: 14 },
  { category: "CITY", code: "SARGODHA", label: "Sargodha", parentCode: "SARGODHA_DIST", sortOrder: 15 },
  { category: "CITY", code: "BHALWAL", label: "Bhalwal", parentCode: "SARGODHA_DIST", sortOrder: 16 },
  { category: "CITY", code: "SHEIKHUPURA", label: "Sheikhupura", parentCode: "SHEIKHUPURA_DIST", sortOrder: 17 },
  { category: "CITY", code: "MURIDKE", label: "Muridke", parentCode: "SHEIKHUPURA_DIST", sortOrder: 18 },
  { category: "CITY", code: "GUJRAT", label: "Gujrat", parentCode: "GUJRAT_DIST", sortOrder: 19 },
  { category: "CITY", code: "KHARIAN", label: "Kharian", parentCode: "GUJRAT_DIST", sortOrder: 20 },
  { category: "CITY", code: "SAHIWAL", label: "Sahiwal", parentCode: "SAHIWAL_DIST", sortOrder: 21 },
  { category: "CITY", code: "CHICHAWATNI", label: "Chichawatni", parentCode: "SAHIWAL_DIST", sortOrder: 22 },
  { category: "CITY", code: "RAHIM_YAR_KHAN", label: "Rahim Yar Khan", parentCode: "RAHIM_YAR_KHAN_DIST", sortOrder: 23 },
  { category: "CITY", code: "SADIQABAD", label: "Sadiqabad", parentCode: "RAHIM_YAR_KHAN_DIST", sortOrder: 24 },
  { category: "CITY", code: "KASUR", label: "Kasur", parentCode: "KASUR_DIST", sortOrder: 25 },
  { category: "CITY", code: "KOT_RADHA_KISHAN", label: "Kot Radha Kishan", parentCode: "KASUR_DIST", sortOrder: 26 },
  { category: "CITY", code: "JHANG", label: "Jhang", parentCode: "JHANG_DIST", sortOrder: 27 },
  { category: "CITY", code: "SHORKOT", label: "Shorkot", parentCode: "JHANG_DIST", sortOrder: 28 },
  { category: "CITY", code: "ATTOCK", label: "Attock", parentCode: "ATTOCK_DIST", sortOrder: 29 },
  { category: "CITY", code: "HASAN_ABDAL", label: "Hasan Abdal", parentCode: "ATTOCK_DIST", sortOrder: 30 },
  { category: "CITY", code: "CHAKWAL", label: "Chakwal", parentCode: "CHAKWAL_DIST", sortOrder: 31 },
  { category: "CITY", code: "TALAGANG", label: "Talagang", parentCode: "CHAKWAL_DIST", sortOrder: 32 },
  { category: "CITY", code: "JHELUM", label: "Jhelum", parentCode: "JHELUM_DIST", sortOrder: 33 },
  { category: "CITY", code: "PIND_DADAN_KHAN", label: "Pind Dadan Khan", parentCode: "JHELUM_DIST", sortOrder: 34 },

  // Sindh Cities
  { category: "CITY", code: "KARACHI", label: "Karachi", parentCode: "KARACHI_CENTRAL_DIST", sortOrder: 1 },
  { category: "CITY", code: "HYDERABAD", label: "Hyderabad", parentCode: "HYDERABAD_DIST", sortOrder: 2 },
  { category: "CITY", code: "LATIFABAD", label: "Latifabad", parentCode: "HYDERABAD_DIST", sortOrder: 3 },
  { category: "CITY", code: "SUKKUR", label: "Sukkur", parentCode: "SUKKUR_DIST", sortOrder: 4 },
  { category: "CITY", code: "ROHRI", label: "Rohri", parentCode: "SUKKUR_DIST", sortOrder: 5 },
  { category: "CITY", code: "LARKANA", label: "Larkana", parentCode: "LARKANA_DIST", sortOrder: 6 },

  // KPK Cities
  { category: "CITY", code: "PESHAWAR", label: "Peshawar", parentCode: "PESHAWAR_DIST", sortOrder: 1 },
  { category: "CITY", code: "ABBOTTABAD", label: "Abbottabad", parentCode: "ABBOTTABAD_DIST", sortOrder: 2 },
  { category: "CITY", code: "HAVELIAN", label: "Havelian", parentCode: "ABBOTTABAD_DIST", sortOrder: 3 },
  { category: "CITY", code: "MARDAN", label: "Mardan", parentCode: "MARDAN_DIST", sortOrder: 4 },
  { category: "CITY", code: "TAKHT_BHAI", label: "Takht-i-Bahi", parentCode: "MARDAN_DIST", sortOrder: 5 },
  { category: "CITY", code: "MINGORA", label: "Mingora", parentCode: "SWAT_DIST", sortOrder: 6 },
  { category: "CITY", code: "SAIDU_SHARIF", label: "Saidu Sharif", parentCode: "SWAT_DIST", sortOrder: 7 },
  { category: "CITY", code: "NOWSHERA", label: "Nowshera", parentCode: "NOWSHERA_DIST", sortOrder: 8 },
  { category: "CITY", code: "MANSEHRA", label: "Mansehra", parentCode: "MANSEHRA_DIST", sortOrder: 9 },
  { category: "CITY", code: "DERA_ISMAIL_KHAN", label: "Dera Ismail Khan", parentCode: "DERA_ISMAIL_KHAN_DIST", sortOrder: 10 },

  // Balochistan Cities
  { category: "CITY", code: "QUETTA", label: "Quetta", parentCode: "QUETTA_DIST", sortOrder: 1 },
  { category: "CITY", code: "GWADAR", label: "Gwadar", parentCode: "GWADAR_DIST", sortOrder: 2 },
  { category: "CITY", code: "PASNI", label: "Pasni", parentCode: "GWADAR_DIST", sortOrder: 3 },
  { category: "CITY", code: "KHUZDAR", label: "Khuzdar", parentCode: "KHUZDAR_DIST", sortOrder: 4 },

  // Islamabad
  { category: "CITY", code: "ISLAMABAD", label: "Islamabad", parentCode: "ISLAMABAD_DIST", sortOrder: 1 },

  // AJK Cities
  { category: "CITY", code: "MUZAFFARABAD", label: "Muzaffarabad", parentCode: "MUZAFFARABAD_DIST", sortOrder: 1 },
  { category: "CITY", code: "MIRPUR", label: "Mirpur", parentCode: "MIRPUR_AJK_DIST", sortOrder: 2 },

  // Gilgit-Baltistan Cities
  { category: "CITY", code: "GILGIT", label: "Gilgit", parentCode: "GILGIT_DIST", sortOrder: 1 },
  { category: "CITY", code: "SKARDU", label: "Skardu", parentCode: "SKARDU_DIST", sortOrder: 2 },
];

export const geoTowns = [
  // Lahore Towns
  { category: "TOWN", code: "MODEL_TOWN", label: "Model Town", parentCode: "LAHORE", sortOrder: 1 },
  { category: "TOWN", code: "GULBERG", label: "Gulberg", parentCode: "LAHORE", sortOrder: 2 },
  { category: "TOWN", code: "IQBAL_TOWN", label: "Allama Iqbal Town", parentCode: "LAHORE", sortOrder: 3 },
  { category: "TOWN", code: "CANTT_LHR", label: "Lahore Cantonment", parentCode: "LAHORE", sortOrder: 4 },
  { category: "TOWN", code: "DHA_LHR", label: "DHA Lahore", parentCode: "LAHORE", sortOrder: 5 },
  { category: "TOWN", code: "JOHAR_TOWN", label: "Johar Town", parentCode: "LAHORE", sortOrder: 6 },
  { category: "TOWN", code: "SAMANABAD", label: "Samanabad", parentCode: "LAHORE", sortOrder: 7 },
  { category: "TOWN", code: "RAVI_TOWN", label: "Ravi Town", parentCode: "LAHORE", sortOrder: 8 },
  { category: "TOWN", code: "SHALAMAR_TOWN", label: "Shalamar Town", parentCode: "LAHORE", sortOrder: 9 },
  { category: "TOWN", code: "WAPDA_TOWN", label: "Wapda Town", parentCode: "LAHORE", sortOrder: 10 },
  { category: "TOWN", code: "BAHRIA_TOWN_LHR", label: "Bahria Town Lahore", parentCode: "LAHORE", sortOrder: 11 },
  { category: "TOWN", code: "VALANCIA", label: "Valencia Town", parentCode: "LAHORE", sortOrder: 12 },
  { category: "TOWN", code: "FAISAL_TOWN", label: "Faisal Town", parentCode: "LAHORE", sortOrder: 13 },
  { category: "TOWN", code: "GARDEN_TOWN", label: "Garden Town", parentCode: "LAHORE", sortOrder: 14 },
  { category: "TOWN", code: "SABZAZAR", label: "Sabzazar", parentCode: "LAHORE", sortOrder: 15 },
  { category: "TOWN", code: "TOWNSHIP", label: "Township", parentCode: "LAHORE", sortOrder: 16 },
  { category: "TOWN", code: "WALLED_CITY", label: "Walled City (Androon Lahore)", parentCode: "LAHORE", sortOrder: 17 },

  // Karachi Towns
  { category: "TOWN", code: "CLIFTON", label: "Clifton", parentCode: "KARACHI", sortOrder: 1 },
  { category: "TOWN", code: "DHA_KHI", label: "DHA Karachi", parentCode: "KARACHI", sortOrder: 2 },
  { category: "TOWN", code: "GULSHAN_E_IQBAL", label: "Gulshan-e-Iqbal", parentCode: "KARACHI", sortOrder: 3 },
  { category: "TOWN", code: "NORTH_NAZIMABAD", label: "North Nazimabad", parentCode: "KARACHI", sortOrder: 4 },
  { category: "TOWN", code: "SADDAR_KHI", label: "Saddar Karachi", parentCode: "KARACHI", sortOrder: 5 },
  { category: "TOWN", code: "KORANGI_TOWN", label: "Korangi", parentCode: "KARACHI", sortOrder: 6 },
  { category: "TOWN", code: "MALIR_TOWN", label: "Malir Town", parentCode: "KARACHI", sortOrder: 7 },
  { category: "TOWN", code: "GULBERG_KHI", label: "Gulberg Karachi", parentCode: "KARACHI", sortOrder: 8 },
  { category: "TOWN", code: "LIAQUATABAD", label: "Liaquatabad Town", parentCode: "KARACHI", sortOrder: 9 },
  { category: "TOWN", code: "SITE_TOWN", label: "SITE Town", parentCode: "KARACHI", sortOrder: 10 },
  { category: "TOWN", code: "PECHS", label: "PECHS", parentCode: "KARACHI", sortOrder: 11 },
  { category: "TOWN", code: "BAHRIA_TOWN_KHI", label: "Bahria Town Karachi", parentCode: "KARACHI", sortOrder: 12 },

  // Islamabad Towns / Sectors
  { category: "TOWN", code: "F_SECTORS", label: "F-Sectors (F-6, F-7, F-8, F-10, F-11)", parentCode: "ISLAMABAD", sortOrder: 1 },
  { category: "TOWN", code: "G_SECTORS", label: "G-Sectors (G-6, G-7, G-8, G-9, G-10, G-11)", parentCode: "ISLAMABAD", sortOrder: 2 },
  { category: "TOWN", code: "E_SECTORS", label: "E-Sectors (E-7, E-8, E-9, E-11)", parentCode: "ISLAMABAD", sortOrder: 3 },
  { category: "TOWN", code: "I_SECTORS", label: "I-Sectors (I-8, I-9, I-10)", parentCode: "ISLAMABAD", sortOrder: 4 },
  { category: "TOWN", code: "H_SECTORS", label: "H-Sectors (H-8, H-9, H-12)", parentCode: "ISLAMABAD", sortOrder: 5 },
  { category: "TOWN", code: "D_SECTORS", label: "D-Sectors (D-12, D-17)", parentCode: "ISLAMABAD", sortOrder: 6 },
  { category: "TOWN", code: "BANI_GALA", label: "Bani Gala", parentCode: "ISLAMABAD", sortOrder: 7 },
  { category: "TOWN", code: "DHA_ISB", label: "DHA Islamabad", parentCode: "ISLAMABAD", sortOrder: 8 },
  { category: "TOWN", code: "BAHRIA_ISB", label: "Bahria Town Islamabad", parentCode: "ISLAMABAD", sortOrder: 9 },
  { category: "TOWN", code: "CHAK_SHAHZAD", label: "Chak Shahzad", parentCode: "ISLAMABAD", sortOrder: 10 },

  // Rawalpindi Towns
  { category: "TOWN", code: "SADDAR_RWP", label: "Saddar Rawalpindi", parentCode: "RAWALPINDI", sortOrder: 1 },
  { category: "TOWN", code: "CANTT_RWP", label: "Rawalpindi Cantonment", parentCode: "RAWALPINDI", sortOrder: 2 },
  { category: "TOWN", code: "WESTRIDGE", label: "Westridge", parentCode: "RAWALPINDI", sortOrder: 3 },
  { category: "TOWN", code: "CHAKLALA", label: "Chaklala Scheme (I, II, III)", parentCode: "RAWALPINDI", sortOrder: 4 },
  { category: "TOWN", code: "SATELLITE_TOWN", label: "Satellite Town", parentCode: "RAWALPINDI", sortOrder: 5 },
  { category: "TOWN", code: "BAHRIA_RWP", label: "Bahria Town Phase 1-8", parentCode: "RAWALPINDI", sortOrder: 6 },
  { category: "TOWN", code: "PESHAWAR_ROAD", label: "Peshawar Road", parentCode: "RAWALPINDI", sortOrder: 7 },
  { category: "TOWN", code: "ADIALA_ROAD", label: "Adiala Road", parentCode: "RAWALPINDI", sortOrder: 8 },

  // Faisalabad Towns
  { category: "TOWN", code: "MADINA_TOWN", label: "Madina Town", parentCode: "FAISALABAD", sortOrder: 1 },
  { category: "TOWN", code: "JINNAH_COLONY", label: "Jinnah Colony", parentCode: "FAISALABAD", sortOrder: 2 },
  { category: "TOWN", code: "PEOPLES_COLONY", label: "Peoples Colony", parentCode: "FAISALABAD", sortOrder: 3 },
  { category: "TOWN", code: "D_GROUND", label: "D Ground", parentCode: "FAISALABAD", sortOrder: 4 },
  { category: "TOWN", code: "GHULAM_MUHAMMAD_ABAD", label: "Ghulam Muhammad Abad", parentCode: "FAISALABAD", sortOrder: 5 },
  { category: "TOWN", code: "MILLAT_TOWN", label: "Millat Town", parentCode: "FAISALABAD", sortOrder: 6 },

  // Multan Towns
  { category: "TOWN", code: "CANTT_MUL", label: "Multan Cantt", parentCode: "MULTAN", sortOrder: 1 },
  { category: "TOWN", code: "GULGASHT", label: "Gulgasht Colony", parentCode: "MULTAN", sortOrder: 2 },
  { category: "TOWN", code: "SHAH_RUKN_E_ALAM", label: "Shah Rukn-e-Alam Colony", parentCode: "MULTAN", sortOrder: 3 },
  { category: "TOWN", code: "BOSAN_ROAD", label: "Bosan Road", parentCode: "MULTAN", sortOrder: 4 },
  { category: "TOWN", code: "DHA_MUL", label: "DHA Multan", parentCode: "MULTAN", sortOrder: 5 },

  // Peshawar Towns
  { category: "TOWN", code: "UNIVERSITY_TOWN", label: "University Town", parentCode: "PESHAWAR", sortOrder: 1 },
  { category: "TOWN", code: "HAYATABAD", label: "Hayatabad", parentCode: "PESHAWAR", sortOrder: 2 },
  { category: "TOWN", code: "CANTT_PEW", label: "Peshawar Cantt", parentCode: "PESHAWAR", sortOrder: 3 },
  { category: "TOWN", code: "GULBAHAR", label: "Gulbahar", parentCode: "PESHAWAR", sortOrder: 4 },
  { category: "TOWN", code: "REGHI_LALMA", label: "Regi Model Town", parentCode: "PESHAWAR", sortOrder: 5 },

  // Quetta Towns
  { category: "TOWN", code: "CANTT_UET", label: "Quetta Cantt", parentCode: "QUETTA", sortOrder: 1 },
  { category: "TOWN", code: "SHAHRAG", label: "Shahrah-e-Iqbal", parentCode: "QUETTA", sortOrder: 2 },
  { category: "TOWN", code: "JINNAH_TOWN_QTA", label: "Jinnah Town", parentCode: "QUETTA", sortOrder: 3 },
  { category: "TOWN", code: "SAMUNGLI", label: "Samungli Road", parentCode: "QUETTA", sortOrder: 4 },
  { category: "TOWN", code: "ZARGHUN", label: "Zarghun Road", parentCode: "QUETTA", sortOrder: 5 },
];
