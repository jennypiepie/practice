import Link from "next/link";

const routes = ['growing', 'blossom', 'homunculus', 'pepyaka', 'scrolling', 'mobius', 'mav',
  'slider'];

export default function Home() {

  return (<>
    {/* <div>HI~</div> */}
    {routes.map((route) => <div key={route}>
      <Link href={route}>{route}</Link>
    </div>)}
  </>)
}
