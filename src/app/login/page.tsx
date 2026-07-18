'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FormShell, Field, TextInput, PrimaryButton, Alert } from '@/components/ui';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const tokenError = searchParams.get('error') === 'invalid_token';

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

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
    setSentTo(email);
  }

  if (sentTo) {
    return (
      <FormShell title="Kontrolli oma e-posti" subtitle="Saatsime Sulle ühekordse sisselogimislingi.">
        <Alert kind="success">
          Saatsime sisselogimislingi aadressile <strong>{sentTo}</strong>. Link kehtib 15 minutit ja
          töötab ainult üks kord — ava see samas brauseris, kust soovid sisse logida.
        </Alert>
      </FormShell>
    );
  }

  return (
    <FormShell
      title="Logi sisse"
      subtitle="Sisesta oma e-post — saadame Sulle ühekordse sisselogimislingi."
    >
      {tokenError && (
        <Alert kind="error">
          Link on aegunud, juba kasutatud või vale. Palun sisesta oma e-post uuesti, et saada uus link.
        </Alert>
      )}
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
          {loading ? 'Saadan linki…' : 'Saada sisselogimislink'}
        </PrimaryButton>
      </form>
    </FormShell>
  );
}
