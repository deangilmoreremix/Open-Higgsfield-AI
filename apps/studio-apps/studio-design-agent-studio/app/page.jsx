'use client';
import dynamic from 'next/dynamic';
const Studio = dynamic(() => import('studio').then(m => m.DesignAgentStudio), { ssr: false });
export default function Page() { return <Studio apiKey="demo-key" />; }
