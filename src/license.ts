export async function verifyLicense(licenseKey: string, repoFullName: string): Promise<{ valid: boolean; reason?: string }> {
  // If the license key is completely missing or empty, it's invalid.
  if (!licenseKey || licenseKey.trim() === '') {
    return { valid: false, reason: 'License key is missing or empty.' };
  }

  // TODO: Replace with actual API call to licensing server (e.g., LemonSqueezy)
  // Mock logic: allow any key that starts with "pro-" for testing purposes
  if (!licenseKey.startsWith('pro-')) {
    return { valid: false, reason: 'Invalid license key format.' };
  }

  return { valid: true };
}
