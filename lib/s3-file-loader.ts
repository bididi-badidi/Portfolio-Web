"use server";
import { FinalResumeData } from "@/app/interfaces/Resume";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { KnowledgeItem } from "@/app/interfaces/Chatbot";
import { LLM_KNOWLEDGE_FILENAME, MASTER_RESUME_FILENAME } from "@/app/config";
import { envServer } from "@/app/env/server";

const s3 = new S3Client({
  region: envServer.AWS_REGION,
  credentials: {
    accessKeyId: envServer.AWS_ACCESS_KEY_ID,
    secretAccessKey: envServer.AWS_SECRET_ACCESS_KEY,
  },
});

export async function getMasterResume(key: string = MASTER_RESUME_FILENAME): Promise<FinalResumeData> {
  const command = new GetObjectCommand({
    Bucket: envServer.AWS_BUCKET_NAME,
    Key: key,
  });

  const response = await s3.send(command);

  const str = await response.Body?.transformToString();
  if (!str) throw new Error("Empty string fetched.");

  return JSON.parse(str) as FinalResumeData;
}

export const getKnowledgeData = async (key: string = LLM_KNOWLEDGE_FILENAME): Promise<KnowledgeItem> => {
  const command = new GetObjectCommand({
    Bucket: envServer.AWS_BUCKET_NAME,
    Key: key,
  });

  const response = await s3.send(command);

  const str = await response.Body?.transformToString();
  if (!str) throw new Error("Fetched empty string");

  return JSON.parse(str) as KnowledgeItem;
};

const getGeneralPdf = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: envServer.AWS_BUCKET_NAME,
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
