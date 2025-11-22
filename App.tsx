import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import GlovesEnhancer from './components/tools/GlovesEnhancer';
import EcommerceShotCreator from './components/tools/EcommerceShotCreator';
import VariantsGenerator from './components/tools/VariantsGenerator';
import SceneComposer from './components/tools/SceneComposer';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string>('gloves');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar activeTool={activeTool} onSelectTool={setActiveTool} />

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto relative">
        
        {/* Tool: Gloves Enhancer */}
        <div style={{ display: activeTool === 'gloves' ? 'block' : 'none' }} className="h-full">
          <GlovesEnhancer />
        </div>

        {/* Tool: Ecommerce Shot Creator */}
        <div style={{ display: activeTool === 'ecommerce' ? 'block' : 'none' }} className="h-full">
          <EcommerceShotCreator />
        </div>

        {/* Tool: Variants Generator */}
        <div style={{ display: activeTool === 'variants' ? 'block' : 'none' }} className="h-full">
          <VariantsGenerator />
        </div>

        {/* Tool: Scene Composer */}
        <div style={{ display: activeTool === 'scene' ? 'block' : 'none' }} className="h-full">
          <SceneComposer />
        </div>

      </main>
    </div>
  );
};

export default App;