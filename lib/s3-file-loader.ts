"use server";
import { FinalResumeData } from "@/app/interfaces/Resume";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { MASTER_RESUME_FILENAME } from "@/app/config";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function getMasterResume(key: string = MASTER_RESUME_FILENAME): Promise<FinalResumeData> {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  const response = await s3.send(command);

  const str = await response.Body?.transformToString();
  if (!str) throw new Error("Empty string fetched.");

  return JSON.parse(str) as FinalResumeData;
}

const getGeneralPdf = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  const response = await s3.send(command);

  if (!response.Body) throw new Error("Fetched empty body");

  return response.Body.transformToByteArray();
};

export async function downloadResumePdf(key: string) {
  try {
    const pdfBytes = await getGeneralPdf(key);
    return Buffer.from(pdfBytes).toString("base64");
  } catch (error) {
    console.error("Error downloading PDF:", error);
    return null;
  }
}
