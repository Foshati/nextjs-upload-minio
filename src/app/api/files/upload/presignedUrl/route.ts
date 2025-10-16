import { NextRequest, NextResponse } from "next/server";
import type { ShortFileProp, PresignedUrlProp } from "@/lib/types";
import { createPresignedUrlToUpload } from "@/lib/s3-file-management";
import { env } from "@/lib/env";
import { nanoid } from "nanoid";

const bucketName = env.S3_BUCKET_NAME;
const expiry = 60 * 60; // 1 hour

export async function POST(request: NextRequest) {
  // get the files from the request body
  const files = await request.json() as ShortFileProp[];

  if (!files?.length) {
    return NextResponse.json({ message: "No files to upload" }, { status: 400 });
  }

  const presignedUrls = [] as PresignedUrlProp[];

  if (files?.length) {
    // use Promise.all to get all the presigned urls in parallel
    await Promise.all(
      // loop through the files
      files.map(async (file) => {
        const fileName = `${nanoid(5)}-${file?.originalFileName}`;

        // get presigned url using s3 sdk
        const url = await createPresignedUrlToUpload({
          bucketName,
          fileName,
          expiry,
        });
        // add presigned url to the list
        presignedUrls.push({
          fileNameInBucket: fileName,
          originalFileName: file.originalFileName,
          fileSize: file.fileSize,
          url,
        });
      })
    );
  }

  return NextResponse.json(presignedUrls);
}
