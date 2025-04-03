import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/__root')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/__root"!</div>
}
