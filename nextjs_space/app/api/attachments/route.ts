
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { uploadFile } from "@/lib/s3";
import { getBucketConfig } from "@/lib/aws-config";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const transactionId = formData.get("transactionId") as string;

    if (!file || !transactionId) {
      return NextResponse.json(
        { error: "Arquivo e ID da transação são obrigatórios" },
        { status: 400 }
      );
    }

    // Verify transaction belongs to user
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transação não encontrada" },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const { folderPrefix } = getBucketConfig();
    const key = `${folderPrefix}attachments/${Date.now()}-${file.name}`;

    // Upload to S3
    const fileUrl = await uploadFile(buffer, key, file.type);

    // Create attachment record
    const attachment = await prisma.attachment.create({
      data: {
        transactionId,
        fileName: file.name,
        fileUrl: key,
        fileType: file.type,
        fileSize: file.size,
      },
    });

    return NextResponse.json({ attachment });
  } catch (error) {
    console.error("Upload attachment error:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload do arquivo" },
      { status: 500 }
    );
  }
}

