'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormShell, Field, TextInput, PrimaryButton, Alert } from '@/components/ui';

const roleRedirect: Record<string, string> = {
  ADMIN: '/admin',
  TEADUR: '/teadur',
  OPETAJA: '/opetaja',
  KOOLIJUHT: '/koolijuht/nousolek',
  LAPSEVANEM: '/lapsevanem',
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? 'Sisselogimine ebaõnnestus.');
      return;
    }
    router.push(roleRedirect[data.role] ?? '/');
  }

  return (
    <FormShell
      title="Logi sisse"
      subtitle="Ajutine e-posti-põhine sisselogimine (HarID lisandub hilisemas arendusfaasis)."
    >
      {error && <Alert kind="error">{error}</Alert>}
      <form onSubmit={onSubmit}>
        <Field label="E-post" hint="Sisesta e-post, millega projekti meeskond Su kutsus.">
          <TextInput
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nimi@kool.ee"
          />
        </Field>
        <PrimaryButton type="submit" disabled={loading}>
          {loading ? 'Login sisse…' : 'Logi sisse'}
        </PrimaryButton>
      </form>
    </FormShell>
  );
}
