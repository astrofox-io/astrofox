import { type ClassValue, clsx, twMerge } from 'cnfast';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
