'use client';
import { useEffect, useRef } from 'react';
import Sketch from './sketch';

// import studio from '@theatre/studio';
// import { getProject, types } from '@theatre/core';

export default function Homunculus() {
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