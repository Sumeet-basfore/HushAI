"use client";

import { useState, useEffect } from "react";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Button } from "@/components/ui/button";
import { GlowingInput } from "@/components/ui/glowing-input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Loader2, Search, ExternalLink, Trash2, History, Sparkles } from "lucide-react";
import { analyzeText } from "@/app/actions/analyze";
import { CheckBox } from "@/components/ui/checkbox";

interface ResearchSource {
  title: string;
  link: string;
  snippet: string;
  source: string;
  selected?: boolean;
}

interface ResearchSession {
  id: string;
  query: string;
  sourceTypes: string[];
  results: ResearchSource[];
  createdAt: string;
}

const SOURCE_TYPES = [
  { id: 'reddit', name: 'Reddit', icon: 'R' },
  { id: 'twitter', name: 'Twitter/X', icon: 'X' },
  { id: 'news', name: 'News Sites', icon: 'N' },
  { id: 'blogs', name: 'Blogs', icon: 'B' },
  { id: 'youtube', name: 'YouTube', icon: 'Y' },
  { id: 'academic', name: 'Academic', icon: 'A' },
  { id: 'tiktok', name: 'TikTok', icon: 'T' },
  { id: 'forums', name: 'Forums', icon: 'F' },
  { id: 'ecommerce', name: 'E-commerce', icon: 'E' },
];

interface ResearchPanelProps {
  onResearchComplete?: (sources: ResearchSource[]) => void;
}

export default function ResearchPanel({ onResearchComplete }: ResearchPanelProps) {
  const [query, setQuery] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>(['reddit', 'news', 'blogs']);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ResearchSource[]>([]);
  const [currentSession, setCurrentSession] = useState<ResearchSession | null>(null);
  const [savedSessions, setSavedSessions] = useState<ResearchSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  interface GeneratedContent {
    hooks?: string[];
    scripts?: { title: string; content: string }[];
    description?: string;
    captions?: string[];
    hashtags?: string[];
    related_ideas?: string[];
  }

  const [generatedResult, setGeneratedResult] = useState<GeneratedContent | null>(null);

  // Load saved sessions on mount
  useEffect(() => {
    loadSavedSessions();
  }, []);

  const loadSavedSessions = async () => {
    try {
      const response = await fetch('/api/research/storage');
      const data = await response.json();
      if (data.success) {
        setSavedSessions(data.data);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev =>
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleSearch = async () => {
    if (!query.trim() || selectedSources.length === 0) return;

    setIsLoading(true);
    setError(null);
    setResults([]);
    setStatusMessage("Searching across selected sources...");

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          sourceTypes: selectedSources,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.data.results);
      setStatusMessage(`Found ${data.data.results.length} sources`);

      // Save session to database (optional - UI works without it)
      try {
        const saveResponse = await fetch('/api/research/storage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            query: query.trim(),
            sourceTypes: selectedSources,
            results: data.data.results,
          }),
        });

        const saveData = await saveResponse.json();
        if (saveData.success) {
          setCurrentSession(saveData.data);
          loadSavedSessions();
        } else {
          console.warn('Session not saved to database:', saveData.error);
          // Create a temporary session in memory for selection to work
          setCurrentSession({
            id: `temp_${Date.now()}`,
            query: query.trim(),
            sourceTypes: selectedSources,
            results: data.data.results,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Database save failed, using in-memory session:', err);
        // Create a temporary session in memory
        setCurrentSession({
          id: `temp_${Date.now()}`,
          query: query.trim(),
          sourceTypes: selectedSources,
          results: data.data.results,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleResultSelection = async (link: string, selected: boolean) => {
    // Update UI immediately regardless of session
    setResults(prev =>
      prev.map(r =>
        r.link === link ? { ...r, selected } : r
      )
    );

    // Only try to save to database if we have a session
    if (!currentSession) {
      console.log('No session - selection saved in memory only');
      return;
    }

    try {
      const response = await fetch('/api/research/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-selection',
          sessionId: currentSession.id,
          link,
          selected,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to save selection to database, but UI is updated');
      }
    } catch (err) {
      console.error('Failed to update selection:', err);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/research/storage?sessionId=${sessionId}`);
      const data = await response.json();
      if (data.success) {
        setCurrentSession(data.data);
        setQuery(data.data.query);
        setSelectedSources(data.data.sourceTypes);
        setResults(data.data.results);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    }
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/research/storage?sessionId=${sessionId}`, {
        method: 'DELETE',
      });
      loadSavedSessions();
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setResults([]);
        setQuery("");
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleGenerateContent = async () => {
    const selectedResults = results.filter(r => r.selected);
    if (selectedResults.length === 0) {
      setError('Please select at least one source');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setStatusMessage("Generating content from selected sources...");

    try {
      // Combine selected sources into a research context
      const researchContext = selectedResults
        .map(r => `[${r.source}] ${r.title}: ${r.snippet}`)
        .join('\n\n');

      const prompt = `Based on the following research sources, create viral content ideas and scripts:\n\n${researchContext}`;

      const result = await analyzeText(prompt);

      if (result.success && result.data) {
        setGeneratedResult(result.data);
        if (onResearchComplete) {
          onResearchComplete(selectedResults);
        }
      } else {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
      setStatusMessage("");
    }
  };

  const selectedCount = results.filter(r => r.selected).length;

  return (
    <div className="w-full space-y-6">
      {/* Search Section - Glass Card */}
      <div className="bg-[#1E1E1E]/80 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="font-mono text-primary text-sm mb-4 uppercase tracking-wider">
          Research Query
        </h3>

        <div className="flex gap-2 mb-6">
          <GlowingInput
            type="text"
            placeholder="Enter topic or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            icon={<Search className="w-4 h-4" />}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <ShinyButton
            onClick={handleSearch}
            disabled={isLoading || !query.trim() || selectedSources.length === 0}
            className="font-bold h-12 px-6 font-mono"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </ShinyButton>
        </div>

        {/* Source Type Checkboxes */}
        <div className="mb-4">
          <h4 className="font-mono text-xs text-zinc-500 uppercase mb-3">Select Sources</h4>
          <div className="flex flex-wrap gap-3">
            {SOURCE_TYPES.map((source) => (
              <div
                key={source.id}
                onClick={() => handleSourceToggle(source.id)}
                className="flex items-center cursor-pointer"
              >
                <CheckBox
                  checked={selectedSources.includes(source.id)}
                  onClick={(e) => { e.stopPropagation(); handleSourceToggle(source.id); }}
                />
                <span
                  className={`ml-2 px-2 py-1 rounded border transition-all duration-200 ${                    selectedSources.includes(source.id)
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-zinc-900 border-white/10 text-zinc-400 hover:border-white/30'
                  }`}
                >
                  <span className="font-mono text-xs">{source.name}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {statusMessage && (
          <p className="font-mono text-xs text-zinc-500">{statusMessage}</p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-950/20 border border-red-500/50 text-red-500 rounded font-mono text-sm">
          [ERROR]: {error}
        </div>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-primary text-sm uppercase tracking-wider">
              Research Results
            </h3>
            <Badge variant="secondary" className="font-mono">
              {selectedCount} selected
            </Badge>
          </div>

          <div className="grid gap-3">
            {results.map((result, index) => (
              <Card
                key={index}
                className={`bg-[#1E1E1E]/50 backdrop-blur-sm border transition-all cursor-pointer ${
                  result.selected
                    ? 'border-primary/60 bg-primary/5 shadow-[0_0_15px_rgba(0,200,151,0.1)]'
                    : 'border-white/10 hover:border-white/20'
                }`}
                onClick={() => toggleResultSelection(result.link, !result.selected)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <CheckBox
                        checked={!!result.selected}
                        onClick={(e) => { e.stopPropagation(); toggleResultSelection(result.link, !result.selected); }}
                        size={22}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs font-mono">
                          {result.source}
                        </Badge>
                        <a
                          href={result.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-500 hover:text-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <h4 className="font-medium text-white text-sm mb-1 truncate">
                        {result.title}
                      </h4>
                      <p className="text-xs text-zinc-400 line-clamp-2">
                        {result.snippet}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedCount > 0 && (
            <ShinyButton
              onClick={handleGenerateContent}
              disabled={isGenerating}
              className="w-full h-12"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  GENERATING...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  GENERATE CONTENT FROM {selectedCount} SOURCES
                </>
              )}
            </ShinyButton>
          )}
        </div>
      )}

      {/* Generated Results */}
      {generatedResult && (
        <div className="border border-primary/30 rounded-lg p-6 bg-primary/5">
          <h3 className="font-mono text-primary text-sm mb-4 uppercase tracking-wider">
            Generated Content
          </h3>
          <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono">
            {JSON.stringify(generatedResult, null, 2)}
          </pre>
        </div>
      )}

      {/* Saved Sessions */}
      {savedSessions.length > 0 && (
        <div className="border-t border-white/10 pt-6">
          <h3 className="font-mono text-zinc-500 text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4" />
            Previous Research
          </h3>
          <div className="space-y-2">
            {savedSessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                onClick={() => loadSession(session.id)}
                className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors ${
                  currentSession?.id === session.id
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-zinc-900/30 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-white truncate">{session.query}</p>
                  <p className="font-mono text-xs text-zinc-500">
                    {session.results.length} sources • {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-500 hover:text-red-400"
                  onClick={(e) => deleteSession(session.id, e)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
