'use client';

import { useEffect, useState } from 'react';
import { useAccountSettings, useUpdateAccountSettings } from '@/features/Authentications/authentication.hooks';
import { PushState, disablePush, enablePush, getPushState } from '@/lib/push';

function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (value: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${checked ? 'bg-brand-500' : 'bg-brand-300'}`}
    >
      <span className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

const PUSH_HINTS: Record<PushState, string> = {
  unsupported: "This browser can't show notifications. On iPhone, add CompareHub to your Home Screen first.",
  blocked: 'Notifications are blocked for this site. Allow them in your browser or phone settings.',
  on: 'This device will get a notification when a price drops.',
  off: 'Get a notification on this device when a price drops.'
};

export function AlertSettings() {
  const settings = useAccountSettings(true);
  const updateSettings = useUpdateAccountSettings();
  const [pushState, setPushState] = useState<PushState | 'loading'>('loading');
  const [pushError, setPushError] = useState('');

  useEffect(() => {
    getPushState().then(setPushState, () => setPushState('unsupported'));
  }, []);

  const togglePush = async (on: boolean) => {
    setPushError('');
    try {
      setPushState(on ? await enablePush() : await disablePush());
    } catch (error) {
      setPushError(error instanceof Error ? error.message : 'Could not change notifications.');
    }
  };

  return (
    <section aria-labelledby="alert-settings-heading" className="space-y-4 rounded-lg border border-brand-200 bg-brand-100 p-5 shadow-[0_12px_36px_rgba(193,89,46,0.08)]">
      <h2 id="alert-settings-heading" className="text-base font-bold text-[#3A2417]">
        How should we alert you?
      </h2>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#3A2417]">Email</p>
          <p className="text-xs text-[#3A2417]/70">{settings.data ? `Sent to ${settings.data.email}.` : 'Loading…'}</p>
        </div>
        <Switch
          label="Email alerts"
          checked={settings.data?.emailAlertsEnabled ?? false}
          disabled={!settings.data || updateSettings.isPending}
          onChange={(value) => updateSettings.mutate({ emailAlertsEnabled: value })}
        />
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-brand-200 pt-4">
        <div>
          <p className="text-sm font-semibold text-[#3A2417]">Notifications on this device</p>
          <p className="text-xs text-[#3A2417]/70">{pushState === 'loading' ? 'Checking…' : PUSH_HINTS[pushState]}</p>
          {pushError && <p className="mt-1 text-xs font-medium text-red-700">{pushError}</p>}
        </div>
        <Switch
          label="Notifications on this device"
          checked={pushState === 'on'}
          disabled={pushState === 'loading' || pushState === 'unsupported' || pushState === 'blocked'}
          onChange={togglePush}
        />
      </div>
    </section>
  );
}
