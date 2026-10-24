// The signed Android app is published as a GitHub release asset; "latest" always points at the newest build.
export const ANDROID_APK_URL = 'https://github.com/mahjabin-mim/CompareHub2_android/releases/latest/download/CompareHub.apk';

// Off until the first APK exists, so visitors are never sent to a missing download.
// Turn on with NEXT_PUBLIC_ANDROID_APP=true.
export const isAndroidAppAvailable = () => process.env.NEXT_PUBLIC_ANDROID_APP === 'true';
