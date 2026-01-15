import React from 'react';

export const Icon = ({ name, className }: { name: string; className?: string }) => {
  const icons: Record<string, React.ReactElement> = {
    Home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    Dumbbell: <path d="M6.5 6.5l11 11M21 21l-1-1M3 3l1 1m0 0l3 3M7 7l3 3M17 17l3 3M5 5l2 2m4 4l2 2m-2-2l-4-4" />,
    List: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
    Search: <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />,
    User: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    Plus: <path d="M12 5v14M5 12h14" />,
    LogOut: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
    Filter: <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />,
    X: <path d="M18 6L6 18M6 6l12 12" />,
    Check: <path d="M20 6L9 17l-5-5" />,
    ChevronDown: <path d="M6 9l6 6 6-6" />,
    Camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
    Upload: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>,
    Info: <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>
  };

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {icons[name] || <circle cx="12" cy="12" r="10" />}
    </svg>
  );
};