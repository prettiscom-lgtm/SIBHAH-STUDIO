import React from 'react';
import { Wand2, Camera, Layers, Sparkles, ImagePlus } from 'lucide-react';

interface SidebarProps {
  activeTool: string;
  onSelectTool: (toolId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTool, onSelectTool }) => {
  const menuItems = [
    { id: 'gloves', label: 'Gloves Enhancer', icon: Wand2, description: 'Texture & Fit Refinement' },
    { id: 'ecommerce', label: 'Ecommerce Shot', icon: Camera, description: 'Flat Lay Creator' },
    { id: 'variants', label: 'Variants Generator', icon: Sparkles, description: 'Cinematic Glove Shots' },
    { id: 'scene', label: 'Scene Composer', icon: ImagePlus, description: 'Place Product in Scene' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Layers className="w-6 h-6 text-indigo-400" />
          <span>Studio AI</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeTool === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTool(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
              <div className="text-left">
                <div className="font-medium">{item.label}</div>
                <div className={`text-xs ${isActive ? 'text-indigo-200' : 'text-slate-600 group-hover:text-slate-400'}`}>
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-500 text-center">
          Developed by Spell Agency
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;