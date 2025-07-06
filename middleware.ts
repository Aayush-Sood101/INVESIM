import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/game",
  "/game/play", 
  "/results",
  "/sign-in(.*)",
  "/sign-up(.*)"
])

export default clerkMiddleware((auth, req) => {
  // For now, allow all routes - you can customize authentication later
  // if (!isPublicRoute(req)) {
  //   // Add protection logic here when needed
  // }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}

