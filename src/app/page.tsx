
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white dark:bg-black">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex mb-12">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          HushAI&nbsp;
          <span className="font-mono font-bold">Phase 1</span>
        </p>
      </div>

      <div className="relative flex place-items-center">
        <div className="flex flex-col items-center gap-6 text-center">
             <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-black dark:text-white">
            HushAI
          </h1>
          <p className="text-xl text-muted-foreground">
            The Zero-Cost Viral Intelligence Tool for Creators
          </p>

          <Card className="w-[450px] shadow-lg border-2 border-gray-100 dark:border-zinc-800">
            <CardHeader>
              <CardTitle>Analyze Content</CardTitle>
              <CardDescription>Paste a YouTube link to extract viral hooks.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex w-full items-center space-x-2">
                <Input type="text" placeholder="https://youtube.com/watch?v=..." />
                <Button className="bg-[#2563EB] hover:bg-blue-700 text-white">Analyze</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
