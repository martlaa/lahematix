import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

const roleRedirect: Record<string, string> = {
  ADMIN: '/admin',
  TEADUR: '/teadur',
  OPETAJA: '/opetaja',
};

export default async function HomePage() {
  const session = await getSession();
  if (session.userId && session.role) {
    redirect(roleRedirect[session.role] ?? '/login');
  }
  redirect('/login');
}
