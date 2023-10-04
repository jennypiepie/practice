'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import Sketch from '../sketch';

export default function Canvas() {

    const pathname = usePathname();
    const page = pathname.split('/')[2] || 'index';
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sketchRef = useRef<Sketch | null>(null);

    useEffect(() => {
        const sketch = sketchRef.current;
        sketch?.changeBG(page);
    }, [page])

    useEffect(() => {
        const sketch = canvasRef.current && new Sketch({
            dom: canvasRef.current,
            images: {
                index: '/imgs/pic1.png',
                about: '/imgs/pic2.png',
                contact: '/imgs/pic3.png',
                blog: '/imgs/pic4.png',
            },
            start: page
        });
        sketchRef.current = sketch;

        return () => {
            sketch?.stop();
        }
    }, [])

    return (<div className='fixed -z-10 w-screen h-screen'>
        <canvas id='canvas' ref={canvasRef} />
    </div>)
}
