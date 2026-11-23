export type RegisteredApp = {
    client_id: string; app_id: string; name: string; owner: string;
    client_type: 'public' | 'confidential'; status: 'pending' | 'approved' | 'revoked';
    origins: string[]; redirect_uris: string[]; allowed_scopes: string[];
    created_at: string; registry_version: number;
};
export type AppsResult = { staticApps: { id: string; name: string; origins: string[] }[]; dynamicApps: { records: RegisteredApp[]; limit: number } };
export function splitLines(value: FormDataEntryValue | null) { return [...new Set(String(value || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean))]; }
