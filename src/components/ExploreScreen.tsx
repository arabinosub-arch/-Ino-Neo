import React, { useEffect, useState } from 'react';
import { fetchPublishedProjects, Project } from '../lib/db';
import { useAuth } from '../lib/AuthContext';
import { Loader2, Globe, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism-tomorrow.css';

export const ExploreScreen: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchPublishedProjects(user);
        setProjects(data.sort((a, b) => {
           let timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
           let timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
           return timeB - timeA;
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F9FA] relative">
      <div className="p-6 border-b border-[#DADCE0] bg-white shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
           <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#202124] flex items-center gap-2">
                <Globe className="text-[#4285F4]" size={24} /> Global Deployments
              </h2>
              <p className="text-[#70757A] mt-1 text-sm">Discover efficient code snippets deployed by Google Cloud network.</p>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[#4285F4]" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[#DADCE0] rounded-xl bg-white">
              <Globe size={32} className="mx-auto text-[#DADCE0] mb-3" />
              <p className="text-[#5F6368] text-sm">No globally deployed projects yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj, idx) => (
                <motion.div 
                  key={proj.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-xl border border-[#DADCE0] shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  <div className="p-4 border-b border-[#DADCE0] flex items-start justify-between bg-white">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-[#202124] tracking-tight">{proj.title}</h3>
                      <p className="text-[13px] text-[#5F6368] mt-1.5 leading-relaxed line-clamp-3">{proj.description}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-[#1E1E1E] max-h-48 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-2 opacity-50">
                       <Code2 size={14} className="text-white" />
                    </div>
                     <pre className="text-[11px] font-mono leading-relaxed m-0 text-[#D4D4D4]">
                        <code dangerouslySetInnerHTML={{ __html: Prism.highlight(proj.code, Prism.languages.typescript, 'typescript') }} />
                     </pre>
                     <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#1E1E1E] to-transparent pointer-events-none" />
                  </div>
                  <div className="px-4 py-2 bg-white border-t border-[#DADCE0] text-[10px] font-bold text-[#70757A] uppercase tracking-wider flex justify-between items-center">
                    <span>Codex Generated</span>
                    <span>Ready</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
