"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { analyzeTranscript, analyzeText } from "@/app/actions/analyze";
import { transcribeAudio } from "@/app/actions/transcribe";
import { ffmpegManager, ExtractionProgress } from "@/lib/ffmpeg";
import { Loader2, UploadCloud, FileVideo, FileAudio, Youtube, Copy, Sparkles, ScrollText, Hash, Lightbulb, Terminal, Activity, Search } from "lucide-react";
import ResearchPanel from "@/components/research-panel";

export default function Home() {
  // State
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdeaIndex, setSelectedIdeaIndex] = useState<number | null>(null);
  const [ideaDecision, setIdeaDecision] = useState<"idle" | "later">("idle");
  const [copyNotice, setCopyNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [scriptLength, setScriptLength] = useState<"short" | "long">("short");
  const [longFormWords, setLongFormWords] = useState<number>(1000);

  const longFormOptions = [
    { value: 500, label: "500 words (~3 min)" },
    { value: 750, label: "750 words (~5 min)" },
    { value: 1000, label: "1000 words (~7 min)" },
    { value: 1500, label: "1500 words (~10 min)" },
    { value: 2000, label: "2000 words (~13 min)" },
  ];

  // Handlers
  async function handleAnalyzeUrl() {
    if (!url) return;
    startProcess("Initializing sequence...");

    try {
      const res = await analyzeTranscript(url, scriptLength, longFormWords);
      handleResult(res);
    } catch {
      handleError("Connection failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAnalyzeFile() {
    if (!file) return;

    // Validate file before processing
    const validation = ffmpegManager.validateFile(file);
    if (!validation.valid) {
      handleError(validation.error || "Invalid file");
      return;
    }

    try {
      let fullTranscript = "";

      if (file.type.startsWith("video/")) {
        // Use chunked processing for long videos
        const onProgress = (progress: ExtractionProgress) => {
          setStatusMessage(progress.message);
          setProgressPercent(progress.progress);
        };

        startProcess("Preparing video processing...");
        
        const chunks = await ffmpegManager.extractAudioInChunks(file, onProgress);
        
        // Transcribe each chunk
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          setStatusMessage(`Transcribing chunk ${i + 1}/${chunks.length}...`);
          setProgressPercent(10 + (i / chunks.length) * 70);

          const formData = new FormData();
          formData.append("file", chunk.blob, `chunk_${i}.mp3`);

          const transResult = await transcribeAudio(formData);
          if (!transResult.success || !transResult.data) {
            handleError(transResult.error || `Transcription failed for chunk ${i + 1}`);
            setIsLoading(false);
            return;
          }

          fullTranscript += transResult.data.text + " ";
        }
      } else {
        // Direct audio file - check size
        if (file.size > 25 * 1024 * 1024) {
          handleError("Audio file too large. Maximum size is 25MB.");
          setIsLoading(false);
          return;
        }

        startProcess("Transcribing audio data...");
        const formData = new FormData();
        const extension = file.name.split(".").pop()?.toLowerCase() || "mp3";
        formData.append("file", file, `input.${extension}`);

        const transResult = await transcribeAudio(formData);
        if (!transResult.success || !transResult.data) {
          handleError(transResult.error || "Transcription failed");
          setIsLoading(false);
          return;
        }

        fullTranscript = transResult.data.text;
      }

      // Analyze
      setStatusMessage("Compiling viral intelligence...");
      setProgressPercent(90);
      const analyzeResult = await analyzeText(fullTranscript.trim(), scriptLength, longFormWords);
      handleResult(analyzeResult);

    } catch (err: unknown) {
      handleError(err instanceof Error ? err.message : "Process terminated");
      setIsLoading(false);
    }
  }

  async function handleGenerateFromIdea() {
    if (!result?.related_ideas || selectedIdeaIndex === null) return;

    const selectedIdea = result.related_ideas[selectedIdeaIndex];
    startProcess(`Generating full pack from IDEA_0${selectedIdeaIndex + 1}...`);

    try {
      const res = await analyzeText(selectedIdea, scriptLength, longFormWords);
      handleResult(res);
    } catch (err) {
      handleError(err instanceof Error ? err.message : "Idea generation failed");
      setIsLoading(false);
    }
  }

  // Helpers
  function startProcess(msg: string) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setStatusMessage(msg);
    setProgressPercent(0);
    setSelectedIdeaIndex(null);
    setIdeaDecision("idle");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleResult(res: any) {
    if (res.success && res.data) {
        setResult(res.data);
    } else {
        setError(res.error || "System Error");
    }
    setIsLoading(false);
    setProgressPercent(0);
  }

  function handleError(msg: string) {
    setError(msg);
    setIsLoading(false);
    setProgressPercent(0);
  }

  function showCopyNotice(type: "success" | "error", message: string) {
    setCopyNotice({ type, message });
    setTimeout(() => setCopyNotice(null), 2200);
  }

  async function copyToClipboard(text: string): Promise<boolean> {
    if (!navigator?.clipboard) {
      showCopyNotice("error", "Clipboard is unavailable in this browser context.");
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      showCopyNotice("success", "Copied to clipboard.");
      return true;
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      showCopyNotice("error", "Copy failed. Please try again.");
      return false;
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-background text-foreground selection:bg-primary/30">

      {/* Header / Status Bar */}
      <div className="w-full border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between font-mono text-xs tracking-widest text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            <span>SYSTEM ONLINE</span>
          </div>
          <div>HUSH.AI v2.0 // PHASE 4</div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 text-center w-full max-w-5xl px-6 py-20">

        {/* Hero */}
        <div className="space-y-4 mb-8">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter font-sans uppercase">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500">Viral</span>
              <span className="text-primary text-glow ml-4">Engine</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-mono max-w-2xl mx-auto">
              [DECODE VIRALITY] . [EXTRACT HOOKS] . [DOMINATE ALGORITHM]
            </p>
        </div>

        {/* Main Input Area */}
        <div className="w-full max-w-3xl">
            <Tabs defaultValue="youtube" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-zinc-900/50 border border-white/5 h-12 p-1">
                <TabsTrigger value="youtube" className="font-mono data-[state=active]:bg-primary data-[state=active]:text-black transition-all">
                    <Youtube className="mr-2 h-4 w-4"/> YOUTUBE_LINK
                </TabsTrigger>
                <TabsTrigger value="upload" className="font-mono data-[state=active]:bg-primary data-[state=active]:text-black transition-all">
                    <UploadCloud className="mr-2 h-4 w-4"/> UPLOAD_FILE
                </TabsTrigger>
                <TabsTrigger value="research" className="font-mono data-[state=active]:bg-primary data-[state=active]:text-black transition-all">
                    <Search className="mr-2 h-4 w-4"/> RESEARCH
                </TabsTrigger>
            </TabsList>

            <div className="relative group">
                {/* Glow Effect behind card */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-cyan-500 rounded-lg blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>

                <TabsContent value="youtube" className="relative mt-0">
                    <div className="bg-black border border-white/10 rounded-lg p-4 shadow-2xl space-y-3">
                        <div className="flex items-center gap-2">
                            <Input
                                type="text"
                                placeholder="PASTE_SECURE_LINK..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                disabled={isLoading}
                                className="bg-transparent border-none text-white font-mono placeholder:text-zinc-700 h-12 text-lg focus-visible:ring-0"
                            />
                            <Button
                                onClick={handleAnalyzeUrl}
                                disabled={isLoading || !url}
                                className="bg-primary hover:bg-primary/90 text-black font-bold h-12 px-8 font-mono tracking-wider"
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "EXECUTE"}
                            </Button>
                        </div>
                        
                        {/* Script Length Selection */}
                        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-zinc-500">SCRIPT_TYPE:</span>
                                <div className="flex bg-zinc-900 rounded border border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setScriptLength("short")}
                                        className={`px-3 py-1.5 text-xs font-mono rounded-l transition-colors ${
                                            scriptLength === "short" 
                                                ? "bg-primary text-black" 
                                                : "text-zinc-400 hover:text-white"
                                        }`}
                                    >
                                        SHORT (60s)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setScriptLength("long")}
                                        className={`px-3 py-1.5 text-xs font-mono rounded-r transition-colors ${
                                            scriptLength === "long" 
                                                ? "bg-primary text-black" 
                                                : "text-zinc-400 hover:text-white"
                                        }`}
                                    >
                                        LONG
                                    </button>
                                </div>
                            </div>
                            
                            {scriptLength === "long" && (
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-zinc-500">LENGTH:</span>
                                    <select
                                        value={longFormWords}
                                        onChange={(e) => setLongFormWords(Number(e.target.value))}
                                        disabled={isLoading}
                                        className="bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-primary"
                                    >
                                        {longFormOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="upload" className="relative mt-0">
                    <div className="bg-black border border-white/10 rounded-lg p-10 flex flex-col items-center gap-4 text-center cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden">
                          <input
                            type="file"
                            accept="video/*,audio/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            disabled={isLoading}
                        />
                        {file ? (
                              <div className="flex flex-col items-center z-0">
                                <div className="p-4 rounded-full bg-primary/10 mb-2">
                                      {file.type.startsWith("video") ? <FileVideo className="h-8 w-8 text-primary" /> : <FileAudio className="h-8 w-8 text-primary" />}
                                </div>
                                <p className="font-mono text-white text-lg">{file.name}</p>
                                <p className="font-mono text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB // READY_TO_UPLOAD</p>
                                {file.size > 500 * 1024 * 1024 && (
                                  <p className="font-mono text-xs text-red-500 mt-1">⚠️ File exceeds 500MB limit</p>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center z-0">
                                <UploadCloud className="h-10 w-10 text-zinc-600 mb-2" />
                                <p className="font-mono text-zinc-500">DRAG_DROP_OR_CLICK</p>
                                <p className="font-mono text-xs text-zinc-600 mt-2">Max 500MB • 1-2 hour videos supported</p>
                            </div>
                        )}

                          {file && (
                            <Button
                              onClick={handleAnalyzeFile}
                              disabled={isLoading || file.size > 500 * 1024 * 1024}
                              className="w-full bg-primary text-black font-bold font-mono mt-4 z-20 relative"
                            >
                               {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "INITIALIZE_UPLOAD"}
                            </Button>
                          )}
                    </div>
                </TabsContent>

                <TabsContent value="research" className="relative mt-0">
                    <ResearchPanel />
                </TabsContent>
            </div>
            </Tabs>
        </div>

        {/* Loading State */}
        {isLoading && (
            <div className="mt-12 font-mono text-primary flex flex-col items-center gap-4 w-full max-w-md">
                <Activity className="h-8 w-8 animate-spin" />
                <span className="tracking-widest uppercase text-sm">PROCESSING: {statusMessage}</span>
                
                {/* Progress Bar */}
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <span className="text-xs text-zinc-500">{progressPercent}%</span>
            </div>
        )}

        {copyNotice && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-4 py-2 rounded-md border font-mono text-xs backdrop-blur-md ${
              copyNotice.type === "success"
                ? "border-emerald-400/60 bg-emerald-900/30 text-emerald-200"
                : "border-red-400/60 bg-red-950/40 text-red-200"
            }`}
          >
            {copyNotice.message}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="w-full max-w-2xl mt-8 p-4 bg-red-950/20 border border-red-500/50 text-red-500 rounded font-mono text-sm border-l-4 border-l-red-500">
            [ERROR]: {error}
          </div>
        )}

        {/* Results Dashboard */}
        {result && (
          <div className="w-full mt-20 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="flex items-center gap-2 mb-6 font-mono text-sm text-muted-foreground">
                <Terminal className="w-4 h-4"/>
                <span>DATA_ACQUIRED</span>
                <span className="flex-1 h-px bg-white/10"></span>
            </div>

            <Tabs defaultValue="hooks" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8 bg-black border border-white/10 p-1 h-14">
                <TabsTrigger value="hooks" className="font-mono data-[state=active]:bg-zinc-800 data-[state=active]:text-primary h-full"><Sparkles className="w-4 h-4 mr-2"/> HOOKS</TabsTrigger>
                <TabsTrigger value="scripts" className="font-mono data-[state=active]:bg-zinc-800 data-[state=active]:text-primary h-full"><ScrollText className="w-4 h-4 mr-2"/> SCRIPTS</TabsTrigger>
                <TabsTrigger value="metadata" className="font-mono data-[state=active]:bg-zinc-800 data-[state=active]:text-primary h-full"><Hash className="w-4 h-4 mr-2"/> DATA</TabsTrigger>
                <TabsTrigger value="ideas" className="font-mono data-[state=active]:bg-zinc-800 data-[state=active]:text-primary h-full"><Lightbulb className="w-4 h-4 mr-2"/> INTEL</TabsTrigger>
              </TabsList>

              {/* HOOKS TAB */}
              <TabsContent value="hooks">
                <div className="grid gap-4">
                  {result.hooks?.map((hook: string, i: number) => (
                    <Card key={i} className="bg-zinc-900/50 border-white/5 border-l-4 border-l-primary hover:bg-zinc-900 transition-colors group">
                      <CardContent className="p-6 flex justify-between items-start gap-4">
                        <p className="text-lg md:text-xl font-medium font-sans leading-relaxed text-left">{hook}</p>
                        <Button variant="ghost" size="icon" className="text-zinc-500 group-hover:text-primary transition-colors" onClick={() => copyToClipboard(hook)}>
                            <Copy className="w-4 h-4"/>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* SCRIPTS TAB */}
              <TabsContent value="scripts">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {result.scripts?.map((script: any, i: number) => (
                    <div key={i} className="bg-black border border-white/10 rounded-lg overflow-hidden flex flex-col h-full">
                      <div className="bg-zinc-900/50 p-4 border-b border-white/5 flex justify-between items-center">
                          <h3 className="font-mono text-primary text-sm uppercase">{script.title}</h3>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(script.content)} className="text-xs font-mono hover:text-primary">
                              [COPY]
                          </Button>
                      </div>
                      <div className="p-6 font-mono text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed text-left flex-1">
                        {script.content}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* METADATA TAB */}
              <TabsContent value="metadata">
                <div className="grid gap-6 text-left">
                  {/* Description */}
                  <div className="bg-zinc-900/30 border border-white/10 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-mono text-sm text-zinc-500 uppercase">DESCRIPTION.TXT</h3>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.description)} className="text-xs font-mono hover:text-primary">[COPY]</Button>
                    </div>
                    <p className="text-zinc-300 font-sans whitespace-pre-wrap">{result.description}</p>
                  </div>

                  {/* Hashtags */}
                  <div className="bg-zinc-900/30 border border-white/10 p-6 rounded-lg">
                    <h3 className="font-mono text-sm text-zinc-500 uppercase mb-4">TAGS_ARRAY</h3>
                    <div className="flex flex-wrap gap-2">
                        {result.hashtags?.map((tag: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-black border border-white/10 rounded text-xs font-mono text-primary cursor-pointer hover:border-primary transition-colors" onClick={() => copyToClipboard(tag)}>
                                {tag}
                            </span>
                        ))}
                    </div>
                  </div>

                   {/* Captions */}
                   <div className="grid gap-4">
                        {result.captions?.map((cap: string, i: number) => (
                            <div key={i} className="bg-zinc-900/30 border border-white/10 p-4 rounded flex justify-between gap-4 items-start">
                                <p className="text-sm text-zinc-300 font-sans">{cap}</p>
                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(cap)} className="shrink-0 text-zinc-500 hover:text-primary"><Copy className="w-4 h-4"/></Button>
                            </div>
                        ))}
                   </div>
                </div>
              </TabsContent>

              {/* IDEAS TAB */}
              <TabsContent value="ideas">
                <div className="grid gap-4 text-left">
                    {result.related_ideas?.map((idea: string, i: number) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setSelectedIdeaIndex(i);
                              setIdeaDecision("idle");
                            }}
                            className={`p-6 bg-gradient-to-r from-zinc-900 to-black border hover:border-primary/30 transition-all rounded-lg flex gap-4 w-full text-left ${
                              selectedIdeaIndex === i ? "border-primary/60" : "border-white/5"
                            }`}
                        >
                            <Lightbulb className="w-6 h-6 text-yellow-500/50 shrink-0 mt-1"/>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-mono text-primary text-sm">IDEA_0{i + 1}</h4>
                                  {selectedIdeaIndex === i && (
                                    <Badge variant="secondary" className="font-mono text-[10px] tracking-wider">
                                      SELECTED
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-zinc-400 font-sans">{idea}</p>
                            </div>
                        </button>
                    ))}

                    {result.related_ideas?.length > 0 && (
                      <div className="mt-2 p-5 bg-black/40 border border-white/10 rounded-lg">
                        <h4 className="font-mono text-primary text-sm mb-2">NEXT_ACTION</h4>
                        <p className="text-zinc-400 font-sans text-sm mb-4">
                          Generate scripts, hooks, hashtags, and metadata from the selected idea now, or do it later.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <Button
                            onClick={handleGenerateFromIdea}
                            disabled={selectedIdeaIndex === null || isLoading}
                            className="bg-primary text-black font-bold font-mono"
                          >
                            GENERATE_NOW
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIdeaDecision("later")}
                            className="font-mono border-white/20 text-zinc-200 hover:bg-zinc-900"
                          >
                            DO_THIS_AFTERWARDS
                          </Button>
                        </div>

                        {selectedIdeaIndex !== null ? (
                          <p className="mt-3 text-xs font-mono text-zinc-500">
                            SELECTED: IDEA_0{selectedIdeaIndex + 1}
                          </p>
                        ) : (
                          <p className="mt-3 text-xs font-mono text-zinc-600">
                            Select an idea above to enable generation.
                          </p>
                        )}

                        {ideaDecision === "later" && (
                          <p className="mt-2 text-xs font-mono text-primary/80">
                            Noted. You can generate from this section anytime.
                          </p>
                        )}
                      </div>
                    )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

      </div>
    </main>
  );
}
