'use client';
import { useEffect, useRef } from 'react';
import Sketch from './sketch';

export default function Scrolling() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const  sketch = canvasRef.current && new Sketch({ dom: canvasRef.current });
        return () => {
            sketch?.stop();
        }
    }, []);

    return (<>
        <canvas id='canvas' ref={canvasRef} className='bg-black'/>
    </>)
}