import React, { useRef, useContext, createContext } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence, MotionValue } from 'framer-motion';
import { DockItemProps } from '../types';

// Create a context for mouseX to avoid prop drilling issues with Fragments
const DockContext = createContext<MotionValue<number> | null>(null);

const DockItem: React.FC<DockItemProps> = ({ icon: Icon, label, onClick, isActive }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Consume context
  const mouseXContext = useContext(DockContext);
  
  // Fallback for safety (prevents crash if used outside Dock or context is missing)
  const fallbackMouseX = useMotionValue(Infinity);
  const mouseX = mouseXContext || fallbackMouseX;

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Scale based on distance from mouse
  const widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      className="aspect-square relative flex items-center justify-center group cursor-pointer"
      onClick={onClick}
    >
      <motion.div
        className={`w-full h-full rounded-2xl flex items-center justify-center transition-colors duration-300 ${
          isActive 
            ? 'bg-white/20 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.3)] border border-white/30' 
            : 'bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20'
        }`}
      >
        <Icon size={24} className={isActive ? "text-white" : "text-slate-300"} />
      </motion.div>
      
      {/* Tooltip */}
      <AnimatePresence>
        <motion.div
          className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur-sm border border-white/10"
          initial={{ y: 10, opacity: 0 }}
          whileHover={{ y: 0, opacity: 1 }}
        >
          {label}
        </motion.div>
      </AnimatePresence>
      
      {/* Active Indicator dot */}
      {isActive && (
        <div className="absolute -bottom-2 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]" />
      )}
    </motion.div>
  );
};

interface DockProps {
  children: React.ReactNode;
}

export const Dock: React.FC<DockProps> = ({ children }) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <DockContext.Provider value={mouseX}>
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="mx-auto flex h-16 items-end gap-4 rounded-3xl bg-white/5 px-4 pb-3 border border-white/10 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10"
        style={{
          height: 'auto', // Allow height to grow with scale
          paddingBottom: '1rem',
          paddingTop: '1rem',
        }}
      >
        {children}
      </motion.div>
    </DockContext.Provider>
  );
};

export const DockSeparator = () => (
  <div className="w-[1px] h-10 bg-white/20 self-center mx-2" />
);

export { DockItem };