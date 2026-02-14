import { supabase } from './supabase';

export interface ResearchSource {
  title: string;
  link: string;
  snippet: string;
  source: string;
  selected?: boolean;
}

export interface ResearchSession {
  id: string;
  query: string;
  sourceTypes: string[];
  results: ResearchSource[];
  createdAt: string;
  updatedAt: string;
  userId?: string | null;
}

export class ResearchStorage {
  static async createSession(
    query: string,
    sourceTypes: string[],
    results: ResearchSource[],
    userId?: string | null
  ): Promise<ResearchSession> {
    const session: ResearchSession = {
      id: this.generateId(),
      query,
      sourceTypes,
      results,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: userId || null,
    };

    const { error } = await supabase
      .from('research_sessions')
      .insert({
        id: session.id,
        query: session.query,
        source_types: session.sourceTypes,
        results: session.results,
        user_id: session.userId,
        created_at: session.createdAt,
        updated_at: session.updatedAt,
      });

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return session;
  }

  static async getSession(sessionId: string): Promise<ResearchSession | null> {
    const { data, error } = await supabase
      .from('research_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapDbToSession(data);
  }

  static async updateSession(
    sessionId: string,
    updates: Partial<ResearchSession>
  ): Promise<ResearchSession | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    const updatedSession = {
      ...session,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('research_sessions')
      .update({
        query: updatedSession.query,
        source_types: updatedSession.sourceTypes,
        results: updatedSession.results,
        user_id: updatedSession.userId,
        updated_at: updatedSession.updatedAt,
      })
      .eq('id', sessionId);

    if (error) {
      throw new Error(`Failed to update session: ${error.message}`);
    }

    return updatedSession;
  }

  static async updateSourceSelection(
    sessionId: string,
    link: string,
    selected: boolean
  ): Promise<ResearchSession | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    const updatedResults = session.results.map(result =>
      result.link === link ? { ...result, selected } : result
    );

    return this.updateSession(sessionId, { results: updatedResults });
  }

  static async getSessionsByUser(userId?: string | null): Promise<ResearchSession[]> {
    let query = supabase
      .from('research_sessions')
      .select('*')
      .order('updated_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data.map(this.mapDbToSession);
  }

  static async deleteSession(sessionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('research_sessions')
      .delete()
      .eq('id', sessionId);

    return !error;
  }

  static async getSelectedSources(sessionId: string): Promise<ResearchSource[]> {
    const session = await this.getSession(sessionId);
    if (!session) return [];
    return session.results.filter(r => r.selected);
  }

  private static generateId(): string {
    return `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static mapDbToSession(data: any): ResearchSession {
    return {
      id: data.id,
      query: data.query,
      sourceTypes: data.source_types || [],
      results: data.results || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      userId: data.user_id,
    };
  }
}
