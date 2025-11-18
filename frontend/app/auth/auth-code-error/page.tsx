'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">
              Authentication Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              There was an error during the authentication process. This could be
              due to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Invalid or expired authentication code</li>
              <li>Mismatched redirect URL</li>
              <li>Browser session expired</li>
            </ul>
            <div className="mt-6">
              <Link
                href="/login"
                className="inline-block w-full text-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Try Again
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
