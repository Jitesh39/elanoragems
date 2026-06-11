import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, uploadVideo, deleteAsset } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const action = formData.get('action') as string;

    if (action === 'delete') {
      const publicId = formData.get('publicId') as string;
      const resourceType = formData.get('resourceType') as 'image' | 'video';
      
      if (!publicId) {
        return NextResponse.json({ error: 'Missing publicId' }, { status: 400 });
      }

      const result = await deleteAsset(publicId, resourceType || 'image');
      return NextResponse.json({ success: true, result });
    }

    if (action === 'upload') {
      const file = formData.get('file') as File;
      const resourceType = formData.get('resourceType') as 'image' | 'video';

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      // Convert file to base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // We must prepend the data URI scheme for cloudinary uploader
      const mime = file.type;
      const base64Str = `data:${mime};base64,${buffer.toString('base64')}`;

      let result;
      if (resourceType === 'video') {
        result = await uploadVideo(base64Str);
      } else {
        result = await uploadImage(base64Str);
      }

      return NextResponse.json({ success: true, url: result.url, publicId: result.publicId });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('API Upload Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
