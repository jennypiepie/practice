'use client';
import { useEffect, useRef, useLayoutEffect } from 'react';
import Sketch from './sketch';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from "./splitText.js"

gsap.registerPlugin(ScrollTrigger);

export default function Mav() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sketchRef = useRef<Sketch | null>(null);

    useEffect(() => {
        const sketch = canvasRef.current && new Sketch({ dom: canvasRef.current });
        sketchRef.current = sketch;
        return () => {
            sketch?.stop();
        }
    }, []);

    useLayoutEffect(() => {
        const sections = document.getElementsByClassName('section');
        const wrap = document.getElementById('wrap');

        [...sections].forEach((s, index) => {
            const child = document.createElement('h1');
            child.setAttribute('class', 'text-6xl');
            child.innerHTML = ` ${index + 1} TIELE BE HAPPY`;
            s.prepend(child);
            let mySplitText = new SplitText(child);

            gsap.from(mySplitText.chars, {
                scrollTrigger: {
                    trigger: child,
                    scrub: 1,
                    toggleActions: 'restart pause reverse pause',

                },
                duration: 0.5,
                stagger: 0.07,
                scale: 3,
                autoAlpha: 0,
                rotation: 90,
            });
        });

        // let o = { a: 0 };
        // gsap.to(o, {
        //     a: 1,
        //     scrollTrigger: {
        //         trigger: wrap,
        //         markers: true,
        //         scrub: 2,
        //         start: 'top, top',
        //         end: 'bottom bottom',
        //         snap: 1 / (sections.length - 1),
        //         onUpdate: (self) => {
        //             const sketch = sketchRef.current;
        //             if (sketch?.model) {
        //                 sketch!.model!.rotation.y = 2 * Math.PI * self.progress;
        //                 sketch!.model!.position.z = -6 * Math.sin(Math.PI * self.progress);
        //             }
        //         }
        //     }
        // })

        let t1 = gsap.timeline();
        ScrollTrigger.create({
            animation: t1,
            trigger: wrap,
            scrub: 2,
            start: 'top, top',
            end: 'bottom bottom',
            snap: 1 / (sections.length - 1),
            onUpdate: (self) => {
                const sketch = sketchRef.current;
                if (sketch?.model) {
                    sketch!.model!.rotation.y = 2 * Math.PI * self.progress;
                    sketch!.model!.position.z = -6 * Math.sin(Math.PI * self.progress);
                }
            }
        })
    });

    const section = `section min-h-screen w-screen flex border border-solid 
    border-white-500 p-2 text-white box-border flex-col justify-center items-center`;

    return (<>
        <div className='font-serif overflow-y-auto overflow-x-hidden' id='wrap'>
            <div className={section}>
                {/* <h1 className='text-6xl'>1 TIELE BE HAPPY</h1> */}
                <p>abda hfsrb hdfv majw e enbva wnda wdu mvnzi qi bf faaw</p>
            </div>

            <div className={section}>
                {/* <h1 className='text-6xl'>2 TIELE BE HAPPY</h1> */}
                <p>abda hfsrb hdfv majw e enbva wnda wdu mvnzi qi bf faaw</p>
            </div>

            <div className={section}>
                {/* <h1 className='text-6xl'>3 TIELE BE HAPPY</h1> */}
                <p>abda hfsrb hdfv majw e enbva wnda wdu mvnzi qi bf faaw</p>
            </div>
            <canvas id='canvas' ref={canvasRef}
                className='bg-black fixed left-0 top-0 w-screen h-screen -z-10' />
        </div>
    </>)
}