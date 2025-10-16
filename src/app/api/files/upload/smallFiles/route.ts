import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { saveFileInBucket } from "@/lib/s3-file-management";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";

const bucketName = env.S3_BUCKET_NAME;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];

    if (!files.length) {
      return NextResponse.json(
        { status: "fail", message: "No files to upload" },
        { status: 400 }
      );
    }

    // Upload files to S3 bucket
    await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        // generate unique file name
        const fileName = `${nanoid(5)}-${file.name}`;
        // Save file to S3 bucket and save file info to database concurrently
        await saveFileInBucket({
          bucketName,
          fileName,
          file: buffer,
        });
        // save file info to database
        await db.file.create({
          data: {
            bucket: bucketName,
            fileName,
            originalName: file.name,
            size: file.size,
          },
        });
      })
    );

    return NextResponse.json({
      status: "ok",
      message: "Files were uploaded successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "fail", message: "Upload error" },
      { status: 500 }
    );
  }
}
