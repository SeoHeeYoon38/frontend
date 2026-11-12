interface OnboardingProfile {
  nickname: string | null;
}

export function shouldCompleteOnboarding(
  newUser: boolean,
  user: OnboardingProfile,
) {
  return newUser || !user.nickname?.trim();
}
