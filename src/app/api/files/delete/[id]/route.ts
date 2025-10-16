import { NextRequest, NextResponse } from "next/server";
import { deleteFileFromBucket } from "@/lib/s3-file-management";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export async function DELETE(
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

  try {
    // Get the file info from database
    const fileObject = await db.file.findUnique({
      where: { id },
      select: { fileName: true },
    });

    if (!fileObject) {
      return NextResponse.json(
        { message: "File not found" },
        { status: 404 }
      );
    }

    // Delete from S3 first
    const s3DeleteSuccess = await deleteFileFromBucket({
      bucketName: env.S3_BUCKET_NAME,
      fileName: fileObject.fileName,
    });

    if (!s3DeleteSuccess) {
      return NextResponse.json(
        { message: "Failed to delete file from storage" },
        { status: 500 }
      );
    }

    // Delete from database
    await db.file.delete({ where: { id } });

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
