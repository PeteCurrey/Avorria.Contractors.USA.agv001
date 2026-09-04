import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(file.name) || '.pdf';
    const filename = `cred_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;

    // Try Supabase Storage first if configured
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const supabase = createAdminClient();
        const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'credentials';

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filename, buffer, {
            contentType: file.type || 'application/pdf',
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filename);

          return NextResponse.json({
            success: true,
            fileUrl: publicUrlData.publicUrl,
            fileName: file.name,
          });
        }
      }
    } catch {
      // Fall through to local public upload fallback
    }

    // Local file fallback for development / test
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    const localUrl = `/uploads/${filename}`;
    return NextResponse.json({
      success: true,
      fileUrl: localUrl,
      fileName: file.name,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'File upload failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
