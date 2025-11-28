import { OnboardingInput } from "./onboarding";
import { BasicProfileInput, UserProfile } from "./profile";
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
};

export type ProfileAboutProps = {
  profile: UserProfile;
  isOwner: boolean;
};

export type LoginRegisterModalProps = {
  isOpen: boolean;
  onClose: () => void;
};
