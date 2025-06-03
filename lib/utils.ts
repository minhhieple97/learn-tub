import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPasswordStrength(password: string) {
  if (!password) return { strength: 0, label: '' };

  let strength = 0;
  if (password.length >= 6) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return { strength, label: labels[strength - 1] || '' };
}

export function getPasswordStrengthColor(strength: number): string {
  if (strength <= 1) return 'bg-red-500';
  if (strength <= 2) return 'bg-yellow-500';
  if (strength <= 3) return 'bg-blue-500';
  return 'bg-green-500';
}
