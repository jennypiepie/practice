'use client';
import { useEffect } from 'react';
import Sketch from './sketch';

export default function Slider() {

    useEffect(() => {
        const sketch = new Sketch();
        const canvas = sketch.app.view as HTMLCanvasElement;
        document.body.appendChild(canvas);
        canvas.style.display = 'block';
        document.body.style.overscrollBehavior = 'none';
    }, []);

    return (<>
        <h1 className='font-serif text-4xl text-white whitespace-nowrap
        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        mix-blend-difference'>
            HAVE A NICE DAY!
        </h1>
    </>)
}