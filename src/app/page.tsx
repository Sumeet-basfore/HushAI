
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { analyzeTranscript } from "@/app/actions/analyze";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hooks, setHooks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!url) return;

    setIsLoading(true);
    setError(null);
    setHooks([]);

    try {
      const result = await analyzeTranscript(url);

      if (result.success && result.data) {
        setHooks(result.data.hooks);
      } else {
        setError(result.error || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white dark:bg-black">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex mb-12">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          HushAI&nbsp;
          <span className="font-mono font-bold">Phase 2: The Brain</span>
        </p>
      </div>

      <div className="relative flex place-items-center flex-col w-full max-w-2xl">
        <div className="flex flex-col items-center gap-6 text-center w-full">
             <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-black dark:text-white">
            HushAI
          </h1>
          <p className="text-xl text-muted-foreground">
            The Zero-Cost Viral Intelligence Tool for Creators
          </p>

          <Card className="w-full shadow-lg border-2 border-gray-100 dark:border-zinc-800">
            <CardHeader>
              <CardTitle>Analyze Content</CardTitle>
              <CardDescription>Paste a YouTube link to extract viral hooks.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex w-full items-center space-x-2">
                <Input
                  type="text"
                  placeholder="https://youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  className="bg-[#2563EB] hover:bg-blue-700 text-white"
                  onClick={handleAnalyze}
                  disabled={isLoading || !url}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Analyze"}
                </Button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm text-left">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {hooks.length > 0 && (
            <div className="w-full grid gap-4 text-left">
              {hooks.map((hook, i) => (
                <Card key={i} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-[#2563EB]">Hook #{i + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium leading-relaxed">{hook}</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => navigator.clipboard.writeText(hook)}>
                      Copy Hook
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}

