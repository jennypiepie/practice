'use client';
import { useEffect, useRef } from 'react';
import Sketch from './sketch';
import { useWheel } from '@use-gesture/react';

export default function Scrolling() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sketchRef = useRef<Sketch | null>(null);

    const bind = useWheel((state) => {
        if (sketchRef.current) {
            sketchRef.current.wheelEvent(state);
        }
    });

    useEffect(() => {
        const sketch = canvasRef.current && new Sketch({ dom: canvasRef.current });
        sketchRef.current = sketch;

        return () => {
            sketch?.stop();
        }
    }, []);

    return (<>
        <canvas id='canvas' ref={canvasRef} className='bg-black' {...bind()} />
    </>)
}