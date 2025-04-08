import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/app/moods')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/moods"!</div>
}
