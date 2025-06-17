import { HeaderContainer } from '@/components/home/header-container';
import { HeaderLogo } from '@/components/home/header-logo';
import { HeaderActions } from '@/components/home/header-actions';
import { getUserInSession } from '@/features/profile/queries';

export async function Header() {
  const user = await getUserInSession();

  return (
    <HeaderContainer>
      <HeaderLogo />
      <HeaderActions user={user} />
    </HeaderContainer>
  );
}
