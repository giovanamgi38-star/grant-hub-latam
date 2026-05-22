import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div style={{ padding: '40px' }}>
      <h1>GrantHub LATAM 🚀</h1>
      <p>Deployment successful</p>
    </div>
  )
}
