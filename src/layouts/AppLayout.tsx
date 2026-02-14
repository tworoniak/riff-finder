import { Outlet, NavLink } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className='min-h-screen bg-background text-text'>
      <header className='border-b border-faint/80'>
        <div className='mx-auto flex max-w-5xl items-center justify-between px-4 py-4'>
          <NavLink to='/' className='text-lg font-semibold tracking-tight'>
            Riff Finder
          </NavLink>

          <nav className='flex items-center gap-4 text-sm'>
            <NavLink
              to='/'
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 ${isActive ? 'bg-surface border border-faint/80' : 'hover:bg-surface'}`
              }
              end
            >
              Home
            </NavLink>

            <NavLink
              to='/discover'
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 ${isActive ? 'bg-surface border border-faint/80' : 'hover:bg-surface'}`
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
