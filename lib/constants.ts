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

  // Media validation
  MEDIA: {
    MAX_FILE_SIZE_MB: 10,
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  },

  // Strong foot options
  STRONG_FOOT_OPTIONS: ["left", "right", "both"] as const,
} as const;

// Security constants
export const SECURITY_CONSTANTS = {
  BCRYPT_ROUNDS: 12,
} as const;
