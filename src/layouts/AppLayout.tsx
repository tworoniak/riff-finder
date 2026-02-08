import { Outlet, NavLink } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <header className='border-b border-zinc-800'>
        <div className='mx-auto flex max-w-5xl items-center justify-between px-4 py-4'>
          <NavLink to='/' className='text-lg font-semibold tracking-tight'>
            Riff Finder
          </NavLink>

          <nav className='flex items-center gap-4 text-sm'>
            <NavLink
              to='/'
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 ${isActive ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`
              }
              end
            >
              Home
            </NavLink>

            <NavLink
              to='/discover'
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 ${isActive ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`
              }
            >
              Discover
            </NavLink>
          </nav>
        </div>
      </header>

      <main className='mx-auto max-w-5xl px-4 py-6'>
        <Outlet />
      </main>
    </div>
  );
}
