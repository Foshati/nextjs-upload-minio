import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import type { PresignedUrlProp, FileInDBProp } from "@/lib/types";

export async function POST(request: NextRequest) {
  const presignedUrls = await request.json() as PresignedUrlProp[];

  // Get the file name in bucket from the database
  const saveFilesInfo = await db.file.createMany({
    data: presignedUrls.map((file: FileInDBProp) => ({
      bucket: env.S3_BUCKET_NAME,
      fileName: file.fileNameInBucket,
      originalName: file.originalFileName,
      size: file.fileSize,
    })),
  });

  if (saveFilesInfo) {
    return NextResponse.json({ message: "Files saved successfully" });
  } else {
    return NextResponse.json({ message: "Files not found" }, { status: 404 });
  }
}
