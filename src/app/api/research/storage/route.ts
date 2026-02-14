import { NextRequest, NextResponse } from 'next/server';
import { ResearchStorage } from '@/lib/research-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, query, sourceTypes, results, userId, link, selected } = body;

    switch (action) {
      case 'create':
        if (!query || !sourceTypes || !results) {
          return NextResponse.json(
            { error: 'Missing required fields: query, sourceTypes, results' },
            { status: 400 }
          );
        }
        const newSession = await ResearchStorage.createSession(
          query,
          sourceTypes,
          results,
          userId
        );
        return NextResponse.json({ success: true, data: newSession });

      case 'update-selection':
        if (!sessionId || !link || selected === undefined) {
          return NextResponse.json(
            { error: 'Missing required fields: sessionId, link, selected' },
            { status: 400 }
          );
        }
        const updated = await ResearchStorage.updateSourceSelection(
          sessionId,
          link,
          selected
        );
        if (!updated) {
          return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updated });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Research storage API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Operation failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    if (action === 'selected' && sessionId) {
      const sources = await ResearchStorage.getSelectedSources(sessionId);
      return NextResponse.json({ success: true, data: sources });
    }

    if (sessionId) {
      const session = await ResearchStorage.getSession(sessionId);
      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: session });
    }

    const sessions = await ResearchStorage.getSessionsByUser(
      userId === 'null' ? null : userId
    );
    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Research storage API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Operation failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const deleted = await ResearchStorage.deleteSession(sessionId);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Research storage API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Operation failed' },
      { status: 500 }
    );
  }
}
