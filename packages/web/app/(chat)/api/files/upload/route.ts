import { auth } from "@/app/(auth)/actions";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { z } from "zod";
import { uploadFileToS3 } from "../s3";
import { Resource } from "sst";

// Use Blob instead of File since File is not available in Node.js environment
const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size should be less than 5MB",
    })
    // Update the file type based on the kind of files you want to accept
    .refine((file) => ["image/jpeg", "image/png"].includes(file.type), {
      message: "File type should be JPEG or PNG",
    }),
});

export async function POST(request: Request) {
  console.log("Uploading file to S3");
  const subject = await auth();

  if (!subject) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (request.body === null) {
    return new Response("Request body is empty", { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(", ");

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Get filename from formData since Blob doesn't have name property
    const filename = (formData.get("file") as File).name;
    const fileBuffer = await file.arrayBuffer();

    try {
      const params = {
        bucket: Resource.Images.name,
        key: filename,
        file: Buffer.from(fileBuffer),
        contentType: file.type,
      };
      console.log(
        `Uploading to S3 bucket: ${params.bucket}, key: ${params.key}`
      );

      const data = await uploadFileToS3(params);
      // const data = await put(`${filename}`, fileBuffer, {
      //   access: "public",
      // });

      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
