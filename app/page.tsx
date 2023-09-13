import Link from "next/link";

const routes = ['growing', 'blossom', 'homunculus', 'pepyaka'];

export default function Home() {
  
  return (<>
    <div>HI~</div>
    {routes.map((route) => <div key={route}>
      <Link href={route}>{route}</Link>
    </div>)}
  </>)
}
