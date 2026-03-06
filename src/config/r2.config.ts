import { registerAs } from '@nestjs/config';

function toBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue;
  }

  return value.toLowerCase() === 'true';
}

export default registerAs('r2', () => {
  const accountId = process.env.R2_ACCOUNT_ID;
  console.log(accountId);
  const endpoint =
    process.env.R2_ENDPOINT ??
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

  return {
    accountId,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
    endpoint,
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL,
    useSignedUrl: toBoolean(process.env.R2_USE_SIGNED_URL, true),
    pdfPrefix: process.env.R2_PDF_PREFIX ?? 'shipments',
  };
});
