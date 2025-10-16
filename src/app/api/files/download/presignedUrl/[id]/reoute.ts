import { NextRequest, NextResponse } from "next/server";
import { createPresignedUrlToDownload } from "@/lib/s3-file-management";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

/**
 * This route is used to get presigned url for downloading file from S3
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { message: "Missing or invalid id" },
      { status: 400 }
    );
  }

  // Get the file name in bucket from the database
  const fileObject = await db.file.findUnique({
    where: {
      id,
    },
    select: {
      fileName: true,
    },
  });

  if (!fileObject) {
    return NextResponse.json(
      { message: "Item not found" },
      { status: 404 }
    );
  }

  // Get presigned url from s3 storage
  const presignedUrl = await createPresignedUrlToDownload({
    bucketName: env.S3_BUCKET_NAME,
    fileName: fileObject?.fileName,
  });

  return NextResponse.json(presignedUrl);
}
