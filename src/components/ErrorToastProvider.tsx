import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

interface Props { children: ReactNode }

export default function ErrorToastProvider({ children }: Props) {
  return (
    <>
      {children}
      <Toaster toastOptions={{ className: 'z-50' }} position="top-right" />
    </>
  );
}
