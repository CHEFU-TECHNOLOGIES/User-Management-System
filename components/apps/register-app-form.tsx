"use client";

import { useState, type FormEvent } from 'react';
import { adminApi, errorMessage } from '@/lib/admin-api';
import { splitLines } from '@/lib/apps';

export function RegisterAppForm({ owner, onRegistered, onCancel, onAccessError }: { owner: string; onRegistered: (secret?: string) => void; onCancel: () => void; onAccessError: (error: unknown) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [type, setType] = useState('public');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = {
      name: String(data.get('name')).trim(), appId: String(data.get('appId')).trim(), owner: String(data.get('owner')).trim(),
      clientType: type, origins: splitLines(data.get('origins')), redirectUris: splitLines(data.get('callbacks')),
      allowedScopes: data.getAll('scopes'), status: data.has('activate') ? 'approved' : 'pending',
      ...(data.get('clientId') ? { clientId: String(data.get('clientId')).trim() } : {}),
    };
    setBusy(true); setError('');
    try { const result = await adminApi<{ clientSecret?: string }>('/apps/register', { method: 'POST', body: JSON.stringify(body) }); onRegistered(result.clientSecret); }
    catch (error) { onAccessError(error); setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <section className="panel app-registration"><h2>Register an application</h2><p>Connect a web, mobile, or server app to CheFu sign-in.</p>
    <form onSubmit={event => void submit(event)}><fieldset disabled={busy} className="app-form-fields">
      <label className="field-label">Application name<input name="name" required maxLength={100} placeholder="My new app" /></label>
      <label className="field-label">Application ID<input name="appId" required pattern="[a-z][a-z0-9-]{1,63}" maxLength={64} placeholder="my-new-app" /><small>Lowercase letters, numbers, and hyphens. Used as the app parameter during sign-in.</small></label>
      <label className="field-label">Owner email<input name="owner" type="email" required defaultValue={owner} maxLength={254} /></label>
      <label className="field-label">Client ID (optional)<input name="clientId" pattern="[a-z][a-z0-9-]{1,63}" maxLength={64} placeholder="Generated if left blank" /></label>
      <label className="field-label">Client type<select value={type} onChange={event => setType(event.target.value)}><option value="public">Public — browser or mobile app (PKCE)</option><option value="confidential">Confidential — backend server</option></select><small>{type === 'public' ? 'No client secret. Use S256 PKCE.' : 'The secret is shown once. Keep it on your server.'}</small></label>
      <label className="field-label app-form-wide">Web origins<textarea name="origins" rows={3} placeholder={'https://my-new-app.example.com\nhttp://localhost:3000'} /><small>One exact origin per line. Native-only apps can leave this empty.</small></label>
      <label className="field-label app-form-wide">Callback URLs<textarea name="callbacks" rows={3} required placeholder={'https://my-new-app.example.com/auth/callback\nmyapp://auth'} /><small>One exact URL per line. Web callbacks must belong to a registered origin.</small></label>
      <div className="app-form-wide"><span className="field-label">Identity scopes</span><div className="scope-options">{['openid', 'profile', 'email'].map(scope => <label key={scope}><input type="checkbox" name="scopes" value={scope} defaultChecked />{scope}</label>)}</div></div>
      <label className="app-form-wide"><input type="checkbox" name="activate" defaultChecked /> Activate immediately</label>
      {error && <p className="inline-error app-form-wide" role="alert">{error}</p>}
      <div className="dialog-actions app-form-wide"><button className="button button-primary" type="submit">{busy ? 'Registering…' : 'Register application'}</button><button className="button button-secondary" type="button" onClick={onCancel}>Cancel</button></div>
    </fieldset></form>
  </section>;
}
