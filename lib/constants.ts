// Validation constants for the application

export const VALIDATION_CONSTANTS = {
  // Username validation
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },

  // Profile validation
  PROFILE: {
    BIO_MAX_LENGTH: 500,
    LOCATION_MAX_LENGTH: 255,
    FIRST_NAME_MAX_LENGTH: 100,
    LAST_NAME_MAX_LENGTH: 100,
  },

  // Sports validation
  SPORTS: {
    MAX_POSITIONS: 3,
  },

  // Physical attributes
  PHYSICAL: {
    HEIGHT_MIN_CM: 100,
    HEIGHT_MAX_CM: 250,
  },

  // Athlete metrics validation ranges
  ATHLETE_METRICS: {
    SPRINT_SPEED_30M: { MIN: 3.0, MAX: 8.0 }, // seconds
    AGILITY_T_TEST: { MIN: 8.0, MAX: 20.0 }, // seconds
    BEEP_TEST_LEVEL: { MIN: 1, MAX: 21 },
    BEEP_TEST_SHUTTLE: { MIN: 1, MAX: 16 },
    VERTICAL_JUMP: { MIN: 10, MAX: 150 }, // cm
  },

  // Year validation
  YEAR: {
    MIN: 1950,
    MAX: new Date().getFullYear() + 5,
  },

  // Media validation
  MEDIA: {
    MAX_FILE_SIZE_MB: 10,
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  },

  // Strong foot options
  STRONG_FOOT_OPTIONS: ["left", "right", "both"] as const,

  // Language proficiency levels
  LANGUAGE_LEVELS: [
    "native",
    "fluent",
    "proficient",
    "intermediate",
    "basic",
  ] as const,
} as const;

// Security constants
export const SECURITY_CONSTANTS = {
  BCRYPT_ROUNDS: 12,
} as const;
