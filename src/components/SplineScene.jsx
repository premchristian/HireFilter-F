"use client";

import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center w-full h-full text-white/50">Loading 3D Scene...</div>,
});

export default function SplineScene({ scene }) {
  return (
    <div className="w-full h-full">
      <Spline scene={scene} />
    </div>
  );
}
