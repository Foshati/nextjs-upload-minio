import { NextRequest, NextResponse } from "next/server";
import { getFileFromBucket } from "@/lib/s3-file-management";
import { env } from "@/lib/env";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { message: "Invalid request" },
      { status: 400 }
    );
  }

  // get the file name and original name from the database
  const fileObject = await db.file.findUnique({
    where: {
      id,
    },
    select: {
      fileName: true,
      originalName: true,
    },
  });
  if (!fileObject) {
    return NextResponse.json(
      { message: "Item not found" },
      { status: 404 }
    );
  }
  // get the file from the bucket and pipe it to the response object
  const data = await getFileFromBucket({
    bucketName: env.S3_BUCKET_NAME,
    fileName: fileObject?.fileName,
  });

  if (!data) {
    return NextResponse.json(
      { message: "Item not found" },
      { status: 404 }
    );
  }

  // Convert stream to buffer for App Router
  const chunks: Buffer[] = [];
  for await (const chunk of data) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  // Return file as response with proper headers
  return new NextResponse(buffer, {
    headers: {
      "content-disposition": `attachment; filename="${fileObject?.originalName}"`,
      "content-type": "application/octet-stream",
    },
  });
}
