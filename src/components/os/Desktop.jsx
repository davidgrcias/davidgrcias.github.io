import React from 'react';
import { OSProvider, useOS } from '../../contexts/OSContext';
import Taskbar from './Taskbar';
import WindowFrame from './WindowFrame';

const DesktopContent = () => {
    const { windows } = useOS();

    return (
        <div className="h-screen w-screen overflow-hidden bg-[url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2613&auto=format&fit=crop')] bg-cover bg-center text-white relative">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>

            {/* Desktop Icons Area (Clickable to open apps directly) */}
            <div className="relative z-10 w-full h-full p-6 grid grid-flow-col auto-rows-[100px] gap-6 content-start justify-start">
                 {/* We can add Desktop Shortcuts here later */}
            </div>

            {/* Windows Layer */}
            {windows.map((window) => (
                <WindowFrame key={window.id} window={window} />
            ))}

            {/* Taskbar */}
            <Taskbar />
        </div>
    );
};

const Desktop = () => {
  return (
    <OSProvider>
        <DesktopContent />
    </OSProvider>
  );
};

export default Desktop;
