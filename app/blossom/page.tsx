'use client';
import { useEffect, useRef } from 'react';
import Sketch from './sketch';

export default function Blossom() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const sketch = canvasRef.current && new Sketch({ dom: canvasRef.current });
        return () => {
            sketch?.stop();
        }
    }, []);

    return (<>
        <div className='w-screen h-screen bg-black'>
            <div className='
                w-[40.1vh] h-[68.25vh] box-border
                absolute top-1/2 left-1/2 
                translate-x-[-50%] translate-y-[-50%]
                z-10 pointer-events-none
            '>
                <video className='w-full'
                    src="/videos/1.mp4"
                    autoPlay muted
                    id='video'
                />
            </div>
            <canvas id='canvas' ref={canvasRef} />
        </div>
    </>)
}