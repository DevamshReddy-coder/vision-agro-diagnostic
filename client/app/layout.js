import '../styles/globals.css';

export const viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata = {
  title: 'AgroVision AI | Universal Plant Diagnostics & Neural Agriculture',
  description: 'Deploying high-fidelity computer vision and decentralized intelligence to secure the future of global food systems. Real-time multilingual disease diagnostics for modern farmers.',
  keywords: ['AI Agriculture', 'Crop Diagnostics', 'Plant Disease Detection', 'Precision Farming', 'AgroVision AI'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
