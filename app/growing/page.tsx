'use client';
import { useEffect, useRef } from 'react';
import Sketch from './sketch';

export default function Growing() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const  sketch = canvasRef.current && new Sketch({ dom: canvasRef.current });
        return () => {
            sketch?.stop();
        }
    }, []);

    return (<>
        <canvas id='canvas' ref={canvasRef} />
    </>)
}