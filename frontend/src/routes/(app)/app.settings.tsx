import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/app/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/app/settings"!</div>
}
