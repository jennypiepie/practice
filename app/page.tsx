import Link from "next/link";

const routes = ['growing', 'blossom', 'homunculus', 'pepyaka', 'scrolling', 'mobius', 'mav',
  'slider', 'pixi', 'imagetransition', 'alireza', 'augusto'];

export default function Home() {

  return (<>
    {routes.map((route) => <div key={route}>
      <Link href={route}>{route}</Link>
    </div>)}
  </>)
}
