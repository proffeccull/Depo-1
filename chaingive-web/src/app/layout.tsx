import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'ChainGive - Peer-to-Peer Donation Platform',
  description: 'The Ethical Peer-to-Peer Altruism Engine',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}