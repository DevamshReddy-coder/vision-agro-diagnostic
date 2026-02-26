import '../styles/globals.css';

export const metadata = {
  title: 'AgroVision Enterprise | AI Crop Intelligence',
  description: 'Production-ready AI diagnostic framework for modern agriculture.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
