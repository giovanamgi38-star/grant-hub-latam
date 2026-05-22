import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import * as React from 'react'
import type { QueryClient } from '@tanstack/react-query'
import appCss from '~/styles/app.css?url'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'GrantHub Latam - Convocatorias y Fondos para Latinoamérica' },
      { name: 'description', content: 'Directorio centralizado de convocatorias de grants en Latinoamérica. Encuentra fondos para startups, ONGs, investigadores y emprendedores sociales.' },
      { property: 'og:title', content: 'GrantHub Latam - Convocatorias y Fondos para Latinoamérica' },
      { property: 'og:description', content: 'Directorio centralizado de convocatorias de grants en Latinoamérica. Encuentra fondos para startups, ONGs, investigadores y emprendedores sociales.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' as const },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' },
    ],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4" style={{ color: '#CC0000' }}>404</h1>
        <p className="text-xl mb-6" style={{ color: 'var(--text-secondary)' }}>Página no encontrada</p>
        <a href="/" className="btn-primary inline-block">Volver al inicio</a>
      </div>
    </div>
  ),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}