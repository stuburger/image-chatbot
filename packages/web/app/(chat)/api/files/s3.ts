import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client();

type SignedUrlInput = {
  bucket: string;
  key: string;
  contentType: string;
  filename: string;
};

export async function generatePresignedPutUrl(
  input: SignedUrlInput
): Promise<string> {
  const { bucket, key, contentType, filename } = input;
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 86400,
  });

  return signedUrl;
}

type SignedUrlInputGet = {
  bucket: string;
  key: string;
};

export async function generatePresignedGetUrl(
  input: SignedUrlInputGet
): Promise<string> {
  const { bucket, key } = input;
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 86400,
  });

  return signedUrl;
}

type UploadParams = {
  bucket: string;
  key: string;
  file: Buffer;
};
interface PutBlobResult {
  url: string;
  downloadUrl: string;
  pathname: string;
  contentType?: string;
  contentDisposition: string;
}
export const uploadFileToS3 = async (
  params: UploadParams
): Promise<PutBlobResult> => {
  const { bucket, key, file } = params;
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file,
  });

  try {
    await s3Client.send(command);
    const url = `https://${bucket}.s3.amazonaws.com/${key}`;
    const downloadUrl = url;
    const pathname = `/${key}`;
    const contentDisposition = `attachment; filename="${key}"`;

    return {
      url,
      downloadUrl,
      pathname,
      contentDisposition,
    };
  } catch (caught) {
    if (
      caught instanceof S3ServiceException &&
      caught.name === "EntityTooLarge"
    ) {
      console.error(
        `Error from S3 while uploading object to ${bucket}. \
The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
or the multipart upload API (5TB max).`
      );
    } else if (caught instanceof S3ServiceException) {
      console.error(
        `Error from S3 while uploading object to ${bucket}.  ${caught.name}: ${caught.message}`
      );
    }
    throw caught;
  }
};
