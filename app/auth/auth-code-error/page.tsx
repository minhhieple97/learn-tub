import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, BookOpen } from "lucide-react"
import Link from "next/link"
import { routes } from '@/routes';

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href={routes.home} className="mb-4 flex items-center justify-center space-x-2">
            <BookOpen className="size-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">LearnTub</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="size-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Authentication Error</CardTitle>
            <CardDescription>
              There was a problem signing you in with Google. This could be due to:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• The authentication request was cancelled</li>
              <li>• Network connectivity issues</li>
              <li>• Temporary service unavailability</li>
            </ul>

            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href={routes.login}>Try Again</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href={routes.home}>Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
