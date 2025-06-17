import { HeaderContainer } from '@/components/home/header-container';
import { HeaderLogo } from '@/components/home/header-logo';
import { HeaderActions } from '@/components/home/header-actions';

import { getUserCredits } from '@/features/payments/queries';
import { checkAuth } from '@/lib/require-auth';

export async function Header() {
  const user = await checkAuth();
  const userCredits = await getUserCredits(user.id);
  return (
    <HeaderContainer>
      <HeaderLogo />
      <HeaderActions user={{ ...user, credits: userCredits.data?.credits_available ?? 0 }} />
    </HeaderContainer>
  );
}
