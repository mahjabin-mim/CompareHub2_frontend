// The signed Android app (built from the CompareHub2_android repo) is served from this site itself,
// so the download works for everyone without needing access to that repository.
export const ANDROID_APK_URL = '/CompareHub.apk';

// Turn on with NEXT_PUBLIC_ANDROID_APP=true once the APK exists, so visitors are never sent to a missing file.
export const isAndroidAppAvailable = () => process.env.NEXT_PUBLIC_ANDROID_APP === 'true';
