import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom';

export default function NotFoundPage() {
  const error = useRouteError();

  let message = 'Unknown error';

  if (isRouteErrorResponse(error)) {
    message = error.statusText || `HTTP ${error.status}`;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string') message = maybeMessage;
  }

  return (
    <div className='space-y-3'>
      <h1 className='text-2xl font-semibold'>Something went wrong</h1>
      <p className='text-zinc-300'>{message}</p>
      <Link
        className='inline-block rounded-md bg-zinc-800 px-3 py-2 hover:bg-zinc-700'
        to='/'
      >
        Back home
      </Link>
    </div>
  );
}
