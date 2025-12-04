import { OnboardingInput } from "./onboarding";
import { BasicProfileInput } from "./profile";
import { UserProfile, ExtendedUserProfile } from "./prisma";
import { SportsDetailsInput } from "./sports";
import { OptionalId, OptionalUsername } from "./common";

// ========================================
// Component Prop Types
// ========================================

export type OnboardingWizardProps = {
  initialRoleId?: OptionalId;
  initialUsername?: OptionalUsername;
  onComplete: (data: OnboardingInput) => Promise<void>;
  isSubmitting?: boolean;
};

export type SessionGuardProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export type RoleSelectionProps = {
  value?: OptionalId;
  onChange: (roleId: number) => void;
  error?: string;
};

export type RoleOption = {
  value: number;
  title: string;
  description: string;
};

export type UsernameInputProps = {
  value?: OptionalUsername;
  onChange: (username: string) => void;
  error?: string;
  disabled?: boolean;
};

export type BasicProfileProps = {
  value: BasicProfileInput;
  onChange: (data: BasicProfileInput) => void;
  errors?: Partial<Record<keyof BasicProfileInput, string>>;
};

export type SportsDetailsProps = {
  value: SportsDetailsInput;
  onChange: (data: SportsDetailsInput) => void;
  errors?: Partial<Record<keyof SportsDetailsInput, string>>;
  roleId?: number;
};

export type ReviewSubmitProps = {
  data: OnboardingInput;
  error?: string;
};

export type ProfileImageUploadProps = {
  type: "cover" | "profile";
  userId: string;
  onUpload: (url: string) => void;
};

export type ProfileHeroProps = {
  profile: UserProfile;
  isOwner: boolean;
  currentlyEditing: string | null;
  onSetEditing: (section: string | null) => void;
};

export type ProfileAboutProps = {
  profile: UserProfile;
  isOwner: boolean;
  currentlyEditing: string | null;
  onSetEditing: (section: string | null) => void;
};

export type LoginRegisterModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export type HeaderProps = {
  // Header component props - currently no props needed
};

// ========================================
// Enhanced Profile Component Props
// ========================================

/**
 * Base props for profile section components
 */
export type ProfileSectionProps = {
  profile: ExtendedUserProfile;
  isOwner: boolean;
  currentlyEditing: string | null;
  onSetEditing: (section: string | null) => void;
};

/**
 * Props for KeyInformationSection (athlete-only)
 */
export type KeyInformationSectionProps = ProfileSectionProps;

/**
 * Props for AthleteMetricsSection (athlete-only)
 */
export type AthleteMetricsSectionProps = ProfileSectionProps;

/**
 * Props for RecentActivitySection
 */
export type RecentActivitySectionProps = ProfileSectionProps;

/**
 * Props for ExperienceSection
 */
export type ExperienceSectionProps = ProfileSectionProps;

/**
 * Props for EducationSection
 */
export type EducationSectionProps = ProfileSectionProps;

/**
 * Props for CertificationsSection (coach-only)
 */
export type CertificationsSectionProps = ProfileSectionProps;

/**
 * Props for ProfileSidebar wrapper
 */
export type ProfileSidebarProps = {
  profile: ExtendedUserProfile;
  isOwner: boolean;
  currentlyEditing: string | null;
  onSetEditing: (section: string | null) => void;
};

/**
 * Props for LanguagesWidget
 */
export type LanguagesWidgetProps = {
  uuid: string;
  isOwner: boolean;
  currentlyEditing: string | null;
  onSetEditing: (section: string | null) => void;
};

/**
 * Props for AwardsWidget
 */
export type AwardsWidgetProps = {
  uuid: string;
  isOwner: boolean;
  currentlyEditing: string | null;
  onSetEditing: (section: string | null) => void;
};
