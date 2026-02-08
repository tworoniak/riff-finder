import { useParams } from 'react-router-dom';

export default function ArtistPage() {
  const { id } = useParams();

  return (
    <div>
      <h1 className='text-2xl font-semibold'>Artist</h1>
      <p className='mt-2 text-zinc-300'>Artist ID: {id}</p>
    </div>
  );
}
