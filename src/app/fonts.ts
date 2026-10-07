import { Inter } from 'next/font/google';

// Inter is the only font shipped with the app. Text fonts come from the
// operating system on desktop and Google Fonts on the web.
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
