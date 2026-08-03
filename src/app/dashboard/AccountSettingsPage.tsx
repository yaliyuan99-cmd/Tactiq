/**
 * Account page — profile, involvement preference (with an honest explanation
 * of why we ask), password change, data export, and deletion. No unnecessary
 * personal information is collected anywhere on this page.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Loader2, Check, Download, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { updateProfile, updatePassword, listGestureConfigs, signOut } from '../../lib/api';
import { loadA11yPrefs } from '../../lib/a11yPrefs';

const INVOLVEMENT_OPTIONS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'exploring', label: 'Exploring the project' },
  { value: 'prototype-testing', label: 'Interested in prototype testing' },
  { value: 'researcher', label: 'Researcher or educator' },
  { value: 'accessibility-professional', label: 'Accessibility professional' },
  { value: 'supporter', label: 'Supporter' },
  { value: 'other', label: 'Other' },
];

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [involvement, setInvolvement] = useState('');
  const [profileState, setProfileState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [profileError, setProfileError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pwState, setPwState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    document.title = 'Account · Tactiq';
  }, []);

  useEffect(() => {
    setFullName(user?.fullName ?? '');
  }, [user?.fullName]);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileState('saving');
    try {
      await updateProfile({ fullName, userCategory: involvement || undefined });
      setProfileState('saved');
      window.setTimeout(() => setProfileState('idle'), 2500);
    } catch (err) {
      setProfileState('error');
      setProfileError(
        err instanceof Error
          ? err.message
          : 'We couldn’t save your profile because the connection was interrupted. Your changes are still visible on this device. Try saving again.',
      );
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (newPassword.length < 8) {
      setPwError('Passwords need at least 8 characters.');
      return;
    }
    setPwState('saving');
    try {
      await updatePassword(newPassword);
      setPwState('saved');
      setNewPassword('');
      window.setTimeout(() => setPwState('idle'), 2500);
    } catch (err) {
      setPwState('error');
      setPwError(err instanceof Error ? err.message : 'The password couldn’t be changed. Try again.');
    }
  };

  const exportData = async () => {
    const layouts = await listGestureConfigs().catch(() => []);
    const data = {
      exportedAt: new Date().toISOString(),
      profile: { fullName: user?.fullName ?? null, email: user?.email ?? null, involvement: involvement || null },
      accessibilityPreferences: loadA11yPrefs(),
      commandLayouts: layouts,
      note: 'This is everything Tactiq stores about your account.',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tactiq-account-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const fieldCls =
    'w-full h-12 px-3.5 rounded-md border border-input bg-input-background focus:outline-none';

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl mb-1">Account</h1>
      <p className="text-muted-foreground mb-8 max-w-[60ch]">
        Tactiq stores the minimum: your name, email, involvement preference, command layouts
        and the accessibility settings you choose to save.
      </p>

      <div className="space-y-10">
        {/* Profile */}
        <section aria-labelledby="acct-profile-h">
          <h2 id="acct-profile-h" className="text-lg mb-4">Profile</h2>
          <form onSubmit={saveProfile} noValidate className="space-y-4">
            <div>
              <label htmlFor="acct-email" className="block font-medium mb-1.5">Email</label>
              <input id="acct-email" type="email" value={user?.email ?? ''} disabled className={`${fieldCls} opacity-60 cursor-not-allowed`} />
              <p className="text-sm text-muted-foreground mt-1.5">Your sign-in address; it can’t be changed here yet.</p>
            </div>
            <div>
              <label htmlFor="acct-name" className="block font-medium mb-1.5">Full name</label>
              <input id="acct-name" type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={fieldCls} disabled={profileState === 'saving'} />
            </div>
            <div>
              <label htmlFor="acct-involve" className="block font-medium mb-1.5">
                How would you like to be involved? <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <select id="acct-involve" value={involvement} onChange={(e) => setInvolvement(e.target.value)} className={fieldCls} disabled={profileState === 'saving'}>
                {INVOLVEMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-[56ch]">
                We ask so prototype-testing invitations reach the right people first — especially
                blind and low-vision users and accessibility professionals. It changes nothing else.
              </p>
            </div>
            <div aria-live="polite">
              {profileState === 'error' && <p role="alert" className="text-sm text-destructive">{profileError}</p>}
            </div>
            <button type="submit" disabled={profileState === 'saving'} className="inline-flex items-center gap-2 px-5 h-12 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
              {profileState === 'saving' ? (
                <><Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Saving…</>
              ) : profileState === 'saved' ? (
                <><Check className="w-4 h-4" aria-hidden /> Saved</>
              ) : (
                'Save profile'
              )}
            </button>
          </form>
        </section>

        {/* Password */}
        <section aria-labelledby="acct-pw-h">
          <h2 id="acct-pw-h" className="text-lg mb-4">Change password</h2>
          <form onSubmit={savePassword} noValidate className="space-y-4">
            <div>
              <label htmlFor="acct-pw" className="block font-medium mb-1.5">New password</label>
              <div className="relative">
                <input
                  id="acct-pw"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  aria-invalid={!!pwError}
                  aria-describedby={pwError ? 'acct-pw-error' : 'acct-pw-hint'}
                  className={`${fieldCls} pr-20`}
                  disabled={pwState === 'saving'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-pressed={showPassword}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-3 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p id="acct-pw-hint" className="text-sm text-muted-foreground mt-1.5">At least 8 characters.</p>
              {pwError && <p id="acct-pw-error" role="alert" className="text-sm text-destructive mt-1.5">{pwError}</p>}
            </div>
            <button type="submit" disabled={pwState === 'saving'} className="inline-flex items-center gap-2 px-5 h-12 border border-border rounded-md font-medium hover:bg-secondary transition-colors disabled:opacity-60">
              {pwState === 'saving' ? (
                <><Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Changing…</>
              ) : pwState === 'saved' ? (
                <><Check className="w-4 h-4" aria-hidden /> Changed</>
              ) : (
                'Change password'
              )}
            </button>
          </form>
        </section>

        {/* Data */}
        <section aria-labelledby="acct-data-h">
          <h2 id="acct-data-h" className="text-lg mb-4">Your data</h2>
          <div className="flex flex-wrap gap-3">
            <button onClick={exportData} className="inline-flex items-center gap-2 px-5 h-12 border border-border rounded-md font-medium hover:bg-secondary transition-colors">
              <Download className="w-4 h-4" aria-hidden />
              Export account data
            </button>
            <button onClick={handleSignOut} className="inline-flex items-center gap-2 px-5 h-12 border border-border rounded-md font-medium hover:bg-secondary transition-colors">
              <LogOut className="w-4 h-4" aria-hidden />
              Sign out
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-4 max-w-[56ch]">
            To delete your account and everything in the export, email{' '}
            <a href="mailto:hello@tactiq.app" className="underline underline-offset-4 hover:text-primary-strong">hello@tactiq.app</a>{' '}
            from this address — self-service deletion isn’t built yet, so we do it by hand and
            confirm when it’s done.
          </p>
        </section>
      </div>
    </div>
  );
}
