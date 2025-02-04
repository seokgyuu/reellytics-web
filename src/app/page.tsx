import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Header from '@/components/Header';

export default async function Page() {
  const session = await getServerSession(authOptions); 
  return (
    <div className="min-h-screen">
      <Header />
    </div>
  );
}