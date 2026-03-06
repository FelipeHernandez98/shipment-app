import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface UploadPdfOptions {
  contentType?: string;
  metadata?: Record<string, string>;
}

@Injectable()
export class StorageService {
  private readonly bucketName?: string;
  private readonly publicBaseUrl?: string;
  private readonly useSignedUrl: boolean;
  private readonly client?: S3Client;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('r2.endpoint')?.replace(/\/+$/, '');
    const accessKeyId = this.configService.get<string>('r2.accessKeyId');
    const secretAccessKey = this.configService.get<string>('r2.secretAccessKey');

    this.bucketName = this.configService.get<string>('r2.bucketName');
    this.publicBaseUrl = this.configService.get<string>('r2.publicBaseUrl');
    this.useSignedUrl = this.configService.get<boolean>('r2.useSignedUrl') ?? true;

    if (endpoint && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        region: 'auto',
        endpoint,
        // R2 works more reliably with path-style requests in AWS SDK v3.
        forcePathStyle: true,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
  }

  async uploadPdf(buffer: Buffer, key: string, options?: UploadPdfOptions): Promise<string> {
    const client = this.getClient();
    const bucketName = this.getBucketName();

    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: options?.contentType ?? 'application/pdf',
        Metadata: options?.metadata,
      }),
    );

    return key;
  }

  getPublicUrl(key: string): string {
    if (!this.publicBaseUrl) {
      throw new BadRequestException(
        'R2_PUBLIC_BASE_URL is required to build public URLs.',
      );
    }

    const normalizedBaseUrl = this.publicBaseUrl.replace(/\/+$/, '');
    const normalizedKey = key.replace(/^\/+/, '');

    return `${normalizedBaseUrl}/${normalizedKey}`;
  }

  async getSignedUrl(key: string, expiresInSeconds = 900): Promise<string> {
    const client = this.getClient();
    const bucketName = this.getBucketName();

    return getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
      { expiresIn: expiresInSeconds },
    );
  }

  async getObjectBuffer(key: string): Promise<Buffer> {
    const client = this.getClient();
    const bucketName = this.getBucketName();

    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    );

    if (!response.Body) {
      throw new BadRequestException(`R2 object body is empty for key: ${key}`);
    }

    const bytes = await response.Body.transformToByteArray();
    return Buffer.from(bytes);
  }

  async deleteObject(key: string): Promise<void> {
    const client = this.getClient();
    const bucketName = this.getBucketName();

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    );
  }

  shouldUseSignedUrl(): boolean {
    return this.useSignedUrl;
  }

  private getClient(): S3Client {
    if (!this.client) {
      throw new BadRequestException(
        'R2 client is not configured. Check R2_ENDPOINT, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY.',
      );
    }

    return this.client;
  }

  private getBucketName(): string {
    if (!this.bucketName) {
      throw new BadRequestException('R2_BUCKET_NAME is required.');
    }

    return this.bucketName;
  }
}
