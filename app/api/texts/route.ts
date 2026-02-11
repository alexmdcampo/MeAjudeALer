import { NextResponse } from 'next/server';
import { getSavedTexts, saveText } from '@/lib/server/saved-files';

export async function GET() {
  try {
    const texts = await getSavedTexts();
    return NextResponse.json(texts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch texts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    
    const result = await saveText(name || 'Sem Titulo', content);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in POST /api/texts:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to save text', details: errorMessage }, { status: 500 });
  }
}
