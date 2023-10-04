'use client';
import Link from "next/link";

export default function Nav() {

    return (<div className="flex flex-col fixed right-0">
        <Link href='/imagetransition'>Home</Link>
        <Link href='/imagetransition/about'>About</Link>
        <Link href='/imagetransition/contact'>Contact</Link>
        <Link href='/imagetransition/blog'>Blog</Link>
    </div>)
}