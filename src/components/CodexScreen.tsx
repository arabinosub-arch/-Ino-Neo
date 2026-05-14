import React, { useState, useRef } from 'react';
import { useAuth } from '../lib/AuthContext';
import { generateCodeSnippet, GeneratedCode } from '../lib/gemini';
import { publishProject } from '../lib/db';
import { Loader2, Sparkles, Code2, Globe, FileText, X, Download } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';
import { motion } from 'framer-motion';

export const CodexScreen: React.FC = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedCode | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const [contextFiles, setContextFiles] = useState<{name: string, type: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(f => ({ name: f.name, type: f.type || 'text/plain' }));
      setContextFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setContextFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setResult(null);
    setPublishedId(null);
    try {
      const codeData = await generateCodeSnippet(prompt);
      setResult(codeData);
    } catch (err) {
      alert("Failed to generate code. Please try again.");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!user || !result) return;
    setPublishing(true);
    try {
      const id = await publishProject(user, {
        title: result.title,
        description: result.explanation,
        code: result.code
      });
      setPublishedId(id || null);
    } catch (err) {
      alert("Failed to publish to Google global network.");
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'code'}.tsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden">
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-0 overflow-hidden h-full">
        {/* Left Panel */}
        <div className="lg:col-span-5 border-r border-[#DADCE0] flex flex-col bg-white h-full overflow-y-auto">
          <div className="p-4 border-b border-[#DADCE0] bg-[#F8F9FA] flex justify-between items-center shrink-0">
            <span className="text-xs font-bold text-[#5F6368] uppercase tracking-wider italic flex items-center gap-1">
               <Sparkles size={14} className="text-[#4285F4]" /> AI Prompt Codex
            </span>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold tracking-wide">
              Auto-Optimizing
            </span>
          </div>
          
          <div className="flex-1 p-6 flex flex-col gap-5 overflow-y-auto">
            {result && (
              <div className="bg-[#e8f0fe] rounded-xl p-4 text-sm text-[#1A73E8] border border-[#d2e3fc]">
                <p className="mb-2 font-semibold">Explanation:</p>
                <p>{result.explanation}</p>
              </div>
            )}
            
            <div className="mt-auto shrink-0 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[#70757A] uppercase block">Advanced Instructions & File Context</label>
                <input 
                  type="file" 
                  multiple 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 text-[10px] text-[#4285F4] bg-[#4285F4]/10 px-2 py-1 rounded cursor-pointer hover:bg-[#4285F4]/20 transition-colors border border-transparent hover:border-[#4285F4]/30"
                >
                  <span className="font-bold">+</span> Attach File Check
                </button>
              </div>
              
              {contextFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-1">
                  {contextFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-white border border-[#DADCE0] text-[#5F6368] px-2.5 py-1.5 rounded-md text-xs shadow-sm">
                      <FileText size={12} className="text-[#4285F4]" />
                      <span className="max-w-[120px] truncate">{file.name}</span>
                      <button onClick={() => removeFile(idx)} className="text-[#70757A] hover:text-[#EA4335]">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2 mb-1">
                <button 
                  onClick={() => setPrompt("Make a real iPhone 17 Pro Max using Tailwind CSS and React, complete with interactive screen and realistic bezels.")}
                  className="text-[10px] bg-[#F1F3F4] text-[#5F6368] px-2 py-1 rounded hover:bg-[#E8EAED] border border-[#DADCE0] transition-colors"
                >
                  ⚡ COMMAND: iPhone 17 Pro Max
                </button>
                <button 
                  onClick={() => setPrompt("Create a hyper-optimized file checking utility system.")}
                  className="text-[10px] bg-[#F1F3F4] text-[#5F6368] px-2 py-1 rounded hover:bg-[#E8EAED] border border-[#DADCE0] transition-colors"
                >
                  ⚡ COMMAND: File Checker
                </button>
              </div>

              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-32 p-3 text-sm border border-[#DADCE0] rounded-lg focus:ring-2 focus:ring-[#4285F4] focus:outline-none bg-white resize-none shadow-sm text-[#202124]" 
                placeholder="E.g., Generate a React component for a real-time dashboard... Attach files above to check what the AI uses from..."
              />
              <button 
                onClick={handleGenerate}
                disabled={!prompt.trim() || generating}
                className="w-full bg-[#1A73E8] hover:bg-[#1557b0] disabled:bg-[#8ab4f8] text-white py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {generating ? <Loader2 size={16} className="animate-spin" /> : <span>✨</span>}
                {generating ? "Generating Snippet..." : "Generate Snippet"}
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Panel */}
        <div className="lg:col-span-7 flex flex-col bg-[#1E1E1E] h-full overflow-hidden">
          <div className="h-10 bg-[#2D2D2D] flex items-center justify-between px-4 shrink-0 shadow-sm border-b border-black/20">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
              </div>
              <div className="text-xs text-[#969696] font-mono flex items-center gap-2">
                <Code2 size={14} /> 
                {result ? result.title : "untitled.ts"} — Generated by Gemini
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {result && (
                <button 
                  onClick={handleDownload}
                  className="bg-[#3C4043]/40 text-[#E8EAED] hover:bg-[#3C4043]/60 px-3 py-1 rounded text-xs flex items-center gap-1.5 transition-colors font-medium border border-[#3C4043]/50"
                  title="Save as File"
                >
                  <Download size={14} /> Download File
                </button>
              )}
              {result && user && !publishedId && (
                <button 
                  onClick={handlePublish}
                  disabled={publishing}
                  className="bg-[#4285F4]/20 text-[#8ab4f8] hover:bg-[#4285F4]/30 px-3 py-1 rounded text-xs flex items-center gap-1.5 transition-colors font-medium border border-[#4285F4]/30"
                >
                  {publishing ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                  Deploy
                </button>
              )}
              {publishedId && (
                <span className="text-[#81c995] text-xs font-semibold tracking-wide flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#81c995] rounded-full inline-block animate-pulse"></span> Deployed
                </span>
              )}
              {result && !user && (
                <span className="text-[#9aa0a6] text-[10px] font-semibold uppercase tracking-wider">Sign In to Deploy</span>
              )}
            </div>
          </div>
          
          <div className="flex-1 font-mono text-[13px] leading-relaxed overflow-auto relative">
             {!result && !generating && (
                <div className="absolute inset-0 flex items-center justify-center text-[#5F6368] flex-col gap-4 text-center px-6">
                  <span className="text-[48px] opacity-20">⚡</span>
                  <div>
                    <h3 className="text-sm font-sans font-semibold text-[#202124]">THE FASTEST CODING AI</h3>
                    <p className="text-xs font-sans mt-1">Capable of generating phones, commands, and entire applications instantly.</p>
                  </div>
                </div>
             )}
             {generating && (
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-[#8ab4f8] bg-[#1E1E1E]/80 backdrop-blur-md z-20">
                  <Loader2 size={36} className="animate-spin" />
                  <span className="animate-pulse font-bold tracking-widest text-xs uppercase" style={{ textShadow: '0 0 10px rgba(138,180,248,0.5)' }}>Hyper-Synthesizing Instantly...</span>
                </div>
             )}
             {result && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="h-full"
               >
                 <Editor
                    value={result.code}
                    onValueChange={() => {}}
                    highlight={code => Prism.highlight(code, Prism.languages.typescript, 'typescript')}
                    padding={24}
                    style={{
                      fontFamily: '"JetBrains Mono", monospace, ui-monospace',
                      fontSize: 13,
                      minHeight: '100%',
                      color: '#D4D4D4'
                    }}
                 />
               </motion.div>
             )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="h-8 bg-white border-t border-[#DADCE0] flex items-center px-4 justify-between shrink-0 shadow-[0_-1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4 text-[10px] text-[#70757A] font-medium hidden sm:flex">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Environment: Production</span>
          <span>Region: us-central1 (Global)</span>
          <span className="flex items-center gap-1"><span className="text-[#4285F4]">⚡</span> Generation Speed: Instant</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-[#70757A] uppercase tracking-widest font-bold">
          <span>UTF-8</span>
          <span>Typescript</span>
          <span>Prettier: Active</span>
        </div>
      </footer>
    </div>
  );
};
