import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import Header from '@/components/Header';

export default async function Page() {
  const session = await getServerSession(authOptions); 
  return (
    <div className="min-h-screen">
      <Header />
    </div>
  );
}