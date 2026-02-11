import { NextResponse } from 'next/server';
import { deleteText, getText } from '@/lib/server/saved-files';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const content = await getText(filename);
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    await deleteText(filename);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
