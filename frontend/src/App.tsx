import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share, Check, Copy, Info } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { CodeEditor } from "./components/CodeEditor";
import { VisualizationDisplay } from "./components/VisualizationDisplay";
import { LanguageSelector } from "./components/LanguageSelector";
import { VisualizationTypeSelector } from "./components/VisualizationTypeSelector";
import { ResizablePanels } from "./components/ResizablePanels";
import { ThemeToggle } from "./components/ui/theme-toggle";
import { 
  Language,
  VisualizationType,
  VisualizationRequest,
  VisualizationResponse,
} from './types';
import { getExampleCode } from "./lib/examples";
import { API_CONFIG } from '@/config';

function App() {
  const [error, setError] = useState<string>("");
  const [language, setLanguage] = useState<Language>("python");
  const [vizType, setVizType] = useState<VisualizationType>("static");
  const [code, setCode] = useState<string>("");
  const [visualizationUrl, setVisualizationUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError("");

      if (!code.trim()) {
        throw new Error("Please enter some code");
      }
      
      const request: VisualizationRequest = {
        code: code.trim(),
        language: language,
        visualization_type: vizType
      };

      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/v1${API_CONFIG.VISUALIZATION_ENDPOINT}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data: VisualizationResponse = await response.json();

      if (data.status === "error" || !data.output_url) {
        throw new Error(data.error || "Failed to generate visualization");
      }

      setVisualizationUrl(`${API_CONFIG.BACKEND_URL}${data.output_url}?t=${Date.now()}`)
    } catch (error) {
      console.error("Generation error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate visualization"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLanguageChange = (value: Language) => {
    setLanguage(value);
    setCode(getExampleCode(value, vizType));
  };

  const handleVisualizationTypeChange = (type: VisualizationType) => {
    setVizType(type);
    setCode(getExampleCode(language, type));
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(visualizationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  useEffect(() => {
    setCode(getExampleCode("python", "static"));
  }, []);

  useEffect(() => {
    setCopied(false);
  }, [visualizationUrl]);

  const LeftPanel = (
    <div className="space-y-4 pr-4">
      <div className="bg-card p-4 rounded-lg shadow border border-border">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Editor</h2>
            <HoverCard openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Tips for visualization</span>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent 
                align="start" 
                className="w-80"
                sideOffset={4}
              >
                <div className="space-y-2">
                  <h3 className="font-medium">Tips</h3>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>For Python, use <code className="bg-muted px-1 rounded">plt.savefig()</code> to save static visualizations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>For Python interactive plots, use <code className="bg-muted px-1 rounded">fig.write_html()</code></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>For R, use <code className="bg-muted px-1 rounded">ggsave()</code> to save your plot</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>The backend will handle the output file paths</span>
                    </li>
                  </ul>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
          
          <div className="flex gap-3">
            <LanguageSelector value={language} onChange={handleLanguageChange} />
            <VisualizationTypeSelector value={vizType} onChange={handleVisualizationTypeChange} />
          </div>
        </div>

        <CodeEditor
          language={language}
          code={code}
          onChange={(value) => setCode(value || "")}
        />

        <Button 
          onClick={handleGenerate} 
          className="w-full mt-4 cursor-pointer"
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate Visualization"}
        </Button>
      </div>
    </div>
  );

  const RightPanel = (
    <div className="space-y-4 pl-4">
      <div className="bg-card p-4 rounded-lg shadow border border-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-foreground">Visualization Output</h2>
          {visualizationUrl && (
            <HoverCard openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={`h-8 w-8 hover:bg-accent hover:text-accent-foreground cursor-pointer
                  ${visualizationUrl ? "border border-primary" : ""}`}
                >
                  <Share className="h-4 w-4" />
                  <span className="sr-only">Share visualization</span>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent 
                align="end" 
                className="w-80 p-2"
                sideOffset={8}
              >
                <div className="space-y-3">
                  <p className="text-sm font-medium">Share this visualization</p>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted">
                    <code className="flex-1 text-xs truncate">
                      {visualizationUrl}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 hover:bg-background cursor-pointer"
                      onClick={handleCopyUrl}
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span className="sr-only">
                        {copied ? 'Copied' : 'Copy URL'}
                      </span>
                    </Button>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          )}
        </div>
        
        <div className="rounded-lg overflow-hidden border border-border">
          <VisualizationDisplay
            outputUrl={visualizationUrl}
            error={error}
            isLoading={isGenerating}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">Script Visualizer</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <ResizablePanels
          leftPanel={LeftPanel}
          rightPanel={RightPanel}
          initialLeftWidth={45}
        />
      </main>
    </div>
  );
}

export default App;
