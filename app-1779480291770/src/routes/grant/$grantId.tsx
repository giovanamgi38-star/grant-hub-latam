import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { grants } from '~/data/grants'
import type { Grant } from '~/data/grants'

export const Route = createFileRoute('/grant/$grantId')({
  component: GrantDetailPage,
})

function GrantDetailPage() {
  const { grantId } = Route.useParams()
  const grant = grants.find(g => g.id === grantId)
  
  const [darkMode, setDarkMode] = useState(false)
  const [savedGrants, setSavedGrants] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('granthub_saved')
    if (saved) setSavedGrants(JSON.parse(saved))
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(prefersDark)
    document.documentElement.classList.toggle('dark', prefersDark)
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode(!darkMode)

  const toggleSaved = () => {
    if (!grant) return
    const newSaved = savedGrants.includes(grant.id)
      ? savedGrants.filter(g => g !== grant.id)
      : [...savedGrants, grant.id]
    setSavedGrants(newSaved)
    localStorage.setItem('granthub_saved', JSON.stringify(newSaved))
  }

  const isNew = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  }

  const closesSoon = (deadline: string) => {
    const closeDate = new Date(deadline)
    const now = new Date()
    const diffDays = (closeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 15 && diffDays >= 0
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'tecnología': '💻',
      'educación': '🎓',
      'medio ambiente': '🌱',
      'emprendimiento': '🚀',
      'cultura': '🎨',
      'salud': '❤️',
      'social': '👥',
      'científico': '🔬'
    }
    return icons[category] || '📋'
  }

  const shareGrant = async () => {
    if (!grant) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: grant.title,
          text: `Mira este grant: ${grant.title} - ${grant.organization}`,
          url: window.location.href
        })
      } catch (err) {}
    }
  }

  const relatedGrants = grant
    ? grants.filter(g => g.id !== grant.id && g.category === grant.category).slice(0, 3)
    : []

  if (!grant) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4" style={{ color: '#CC0000' }}>404</h1>
          <p className="text-xl mb-6" style={{ color: 'var(--text-secondary)' }}>Grant no encontrado</p>
          <Link to="/" className="btn-primary inline-block">Volver al inicio</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold" style={{ color: '#CC0000' }}>← Volver</span>
            </Link>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="animate-fade-in">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {isNew(grant.createdAt) && <span className="badge-new">Nueva</span>}
                {closesSoon(grant.deadline) && <span className="badge-closing">Cierra pronto</span>}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{grant.title}</h1>
              <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>{grant.organization}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card p-4 text-center">
              <p className="text-2xl mb-1">📍</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>País</p>
              <p className="font-semibold">{grant.country}</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl mb-1">💰</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Monto</p>
              <p className="font-semibold" style={{ color: '#CC0000' }}>{grant.amount}</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl mb-1">📅</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Cierre</p>
              <p className="font-semibold">{formatDate(grant.deadline)}</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl mb-1">🏷️</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Categoría</p>
              <p className="font-semibold">{getCategoryIcon(grant.category)} {grant.category}</p>
            </div>
          </div>
          <div className="card p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Descripción</h2>
            <p className="leading-relaxed">{grant.description}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>✅</span> Requisitos
              </h2>
              <ul className="space-y-3">
                {grant.requirements.map((req: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[#CC0000] font-bold">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🎁</span> Beneficios
              </h2>
              <ul className="space-y-3">
                {grant.benefits.map((benefit: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[#CC0000] font-bold">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">📋 Tipo de Postulante</h2>
            <div className="flex flex-wrap gap-2">
              {grant.applicantType.map((type: string) => (
                <span key={type} className="px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  {type}
                </span>
              ))}
            </div>
          </div>
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">🔑 Fechas Clave</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <span className="font-medium">Fecha de cierre</span>
                <span className="font-semibold" style={{ color: '#CC0000' }}>{formatDate(grant.deadline)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <span className="font-medium">Publicado</span>
                <span>{formatDate(grant.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <a
              href={grant.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 btn-primary text-center text-lg py-4"
            >
              ➡️ Aplicar ahora
            </a>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeXrbmQdjWRtkSubAwGz-e6fvKFBzYcTFpoVksirLx-4gVZkw/viewform?usp=header"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-center text-lg py-4 px-6"
            >
              📋 Verificar elegibilidad
            </a>
            <button
              onClick={shareGrant}
              className="btn-secondary text-lg py-4 px-8"
            >
              📤 Compartir
            </button>
            <button
              onClick={toggleSaved}
              className="btn-secondary text-lg py-4 px-8"
            >
              {savedGrants.includes(grant.id) ? '❤️ Guardado' : '🤍 Guardar'}
            </button>
          </div>
          {relatedGrants.length > 0 && (
            <section className="border-t pt-8" style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="text-2xl font-bold mb-6">Grants Relacionados</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {relatedGrants.map((related: Grant) => (
                  <Link
                    key={related.id}
                    to="/grant/$grantId"
                    params={{ grantId: related.id }}
                    className="card p-4 hover:shadow-lg transition-all"
                  >
                    <h3 className="font-bold mb-1 line-clamp-2">{related.title}</h3>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{related.organization}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span>{related.country}</span>
                      <span className="font-semibold" style={{ color: '#CC0000' }}>{related.amount}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
      <footer className="border-t py-8" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Link to="/" className="font-bold text-lg mb-2 inline-block">
            <span style={{ color: '#CC0000' }}>Grant</span>Hub Latam
          </Link>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            © 2025 GrantHub Latam. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
