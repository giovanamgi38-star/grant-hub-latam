import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { grants, categories, countries, applicantTypes, amountRanges, deadlines } from '~/data/grants'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [selectedCountry, setSelectedCountry] = useState('todos')
  const [selectedApplicantType, setSelectedApplicantType] = useState('')
  const [selectedAmountRange, setSelectedAmountRange] = useState('todos')
  const [selectedDeadline, setSelectedDeadline] = useState('todos')
  const [showOnlyOpen, setShowOnlyOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [subscribeEmail, setSubscribeEmail] = useState('')
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [subscribeMessage, setSubscribeMessage] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subscribeEmail.trim()) return

    setSubscribeStatus('loading')
    setTimeout(() => {
      setSubscribeStatus('success')
      setSubscribeMessage('¡Gracias por suscribirte! Recibe nuestras convocatorias cada jueves.')
      setSubscribeEmail('')
      setTimeout(() => setSubscribeStatus('idle'), 4000)
    }, 1000)
  }

  useEffect(() => {
    const history = localStorage.getItem('granthub_history')
    if (history) setSearchHistory(JSON.parse(history))
    
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

  const isOpen = (deadline: string) => {
    return new Date(deadline) >= new Date()
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() && !searchHistory.includes(query)) {
      const newHistory = [query, ...searchHistory].slice(0, 10)
      setSearchHistory(newHistory)
      localStorage.setItem('granthub_history', JSON.stringify(newHistory))
    }
  }

  const filteredGrants = useMemo(() => {
    let result = [...grants]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(g =>
        g.title.toLowerCase().includes(query) ||
        g.organization.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query) ||
        g.category.toLowerCase().includes(query) ||
        g.country.toLowerCase().includes(query)
      )
      
      result.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(query) ? 3 : 0
        const bTitle = b.title.toLowerCase().includes(query) ? 3 : 0
        const aOrg = a.organization.toLowerCase().includes(query) ? 2 : 0
        const bOrg = b.organization.toLowerCase().includes(query) ? 2 : 0
        return (aTitle + aOrg) - (bTitle + bOrg)
      })
    }

    if (selectedCategory !== 'todos') {
      result = result.filter(g => g.category === selectedCategory)
    }

    if (selectedCountry !== 'todos') {
      const countryLower = selectedCountry.toLowerCase()
      result = result.filter(g => 
        g.country.toLowerCase().includes(countryLower) || 
        countryLower === 'latinoamérica' || 
        g.country.toLowerCase() === 'latinoamérica' ||
        g.country.toLowerCase() === 'multilateral' ||
        g.country.toLowerCase() === 'global'
      )
    }

    if (selectedApplicantType) {
      result = result.filter(g => g.applicantType.includes(selectedApplicantType))
    }

    if (selectedAmountRange !== 'todos') {
      result = result.filter(g => g.amountRange === selectedAmountRange)
    }

    if (selectedDeadline !== 'todos') {
      const now = new Date()
      const endOfThisWeek = new Date(now)
      endOfThisWeek.setDate(now.getDate() + (7 - now.getDay()))
      const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0)

      result = result.filter(g => {
        const deadline = new Date(g.deadline)
        switch (selectedDeadline) {
          case 'esta-semana':
            return deadline <= endOfThisWeek
          case 'este-mes':
            return deadline <= endOfThisMonth
          case 'proximo-mes':
            return deadline <= endOfNextMonth && deadline > endOfThisMonth
          default:
            return true
        }
      })
    }

    if (showOnlyOpen) {
      result = result.filter(g => isOpen(g.deadline))
    }

    return result
  }, [searchQuery, selectedCategory, selectedCountry, selectedApplicantType, selectedAmountRange, selectedDeadline, showOnlyOpen])

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

  const shareGrant = async (grant: typeof grants[0]) => {
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

  const currentMonthGrants = useMemo(() => {
    const start = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
    const end = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0)
    return grants.filter(g => {
      const deadline = new Date(g.deadline)
      return deadline >= start && deadline <= end
    }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  }, [calendarMonth])

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold" style={{ color: '#CC0000' }}>Grant</span>
              <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Hub</span>
              <span className="text-sm font-medium px-2 py-0.5 rounded" style={{ backgroundColor: '#CC0000', color: 'white' }}>Latam</span>
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Encuentra el grant perfecto para tu proyecto
          </h1>
          <p className="text-lg text-center mb-8" style={{ color: 'var(--text-secondary)' }}>
            Descubre convocatorias de fondos, grants y financiamiento para América Latina
          </p>
          
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Ej: grants para ONGs de medio ambiente en México..."
                className="input text-lg pl-12"
                style={{ paddingLeft: '3rem' }}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
              
              {searchHistory.length > 0 && searchQuery === '' && (
                <div className="absolute top-full left-0 right-0 mt-2 card p-4 z-10">
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Búsquedas recientes</p>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.slice(0, 5).map((term, i) => (
                      <button
                        key={i}
                        onClick={() => setSearchQuery(term)}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-sm font-medium flex items-center gap-2"
                style={{ color: '#CC0000' }}
              >
                <span>{showAdvancedFilters ? '▲' : '▼'}</span>
                Filtros avanzados
              </button>
            </div>
            
            {showAdvancedFilters && (
              <div className="mt-6 p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">País</label>
                    <select 
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="input"
                    >
                      {countries.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de postulante</label>
                    <select 
                      value={selectedApplicantType}
                      onChange={(e) => setSelectedApplicantType(e.target.value)}
                      className="input"
                    >
                      <option value="">Todos</option>
                      {applicantTypes.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Rango de monto</label>
                    <select 
                      value={selectedAmountRange}
                      onChange={(e) => setSelectedAmountRange(e.target.value)}
                      className="input"
                    >
                      {amountRanges.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha de cierre</label>
                    <select 
                      value={selectedDeadline}
                      onChange={(e) => setSelectedDeadline(e.target.value)}
                      className="input"
                    >
                      {deadlines.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOnlyOpen}
                        onChange={(e) => setShowOnlyOpen(e.target.checked)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: '#CC0000' }}
                      />
                      <span className="text-sm font-medium">Solo abiertas</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => {
                      setSelectedCountry('todos')
                      setSelectedApplicantType('')
                      setSelectedAmountRange('todos')
                      setSelectedDeadline('todos')
                      setShowOnlyOpen(false)
                    }}
                    className="text-sm font-medium"
                    style={{ color: '#CC0000' }}
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`chip whitespace-nowrap ${selectedCategory === cat.id ? 'chip-active' : 'chip-inactive'}`}
              >
                <span className="mr-1">{getCategoryIcon(cat.name)}</span>
                {cat.name}
              </button>
            ))}
          </div>
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {filteredGrants.length} {filteredGrants.length === 1 ? 'convocatoria' : 'convocatorias'}
          </span>
        </div>

        {filteredGrants.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">No se encontraron convocatorias</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Intenta con otros términos de búsqueda o ajusta los filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGrants.map((grant, index) => (
              <article
                key={grant.id}
                className="card p-6 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="mb-3">
                  <h3 className="font-bold text-lg mb-1 line-clamp-2">{grant.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{grant.organization}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {isNew(grant.createdAt) && <span className="badge-new">Nueva</span>}
                  {closesSoon(grant.deadline) && <span className="badge-closing">Cierra pronto</span>}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span>📍</span>
                    <span>{grant.country}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>💰</span>
                    <span className="font-semibold" style={{ color: '#CC0000' }}>{grant.amount}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>📅</span>
                    <span>Cierre: {formatDate(grant.deadline)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>🏷️</span>
                    <span className="capitalize">{grant.category}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link
                    to="/grant/$grantId"
                    params={{ grantId: grant.id }}
                    className="flex-1 btn-primary text-center text-sm"
                  >
                    Ver detalles
                  </Link>
                  <button
                    onClick={() => shareGrant(grant)}
                    className="btn-secondary px-3 text-sm"
                  >
                    📤
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="border-t" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">Calendario de Cierres - {calendarMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h2>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'var(--bg-primary)' }}
            >
              ←
            </button>
            <button
              onClick={() => setCalendarMonth(new Date())}
              className="btn-secondary text-sm"
            >
              Mes actual
            </button>
            <button
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'var(--bg-primary)' }}
            >
              →
            </button>
          </div>
          
          {currentMonthGrants.length === 0 ? (
            <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>No hay convocatorias que cierren este mes</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentMonthGrants.map(grant => (
                <div key={grant.id} className="card p-4 flex items-center gap-4">
                  <div className="text-center p-2 rounded-lg" style={{ backgroundColor: '#CC0000', color: 'white', minWidth: '60px' }}>
                    <div className="text-2xl font-bold">{new Date(grant.deadline).getDate()}</div>
                    <div className="text-xs">{new Date(grant.deadline).toLocaleDateString('es-ES', { month: 'short' })}</div>
                  </div>
                  <div>
                    <p className="font-medium line-clamp-1">{grant.title}</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{grant.organization}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="card p-8 text-center" style={{ backgroundColor: '#CC0000', color: 'white' }}>
          <h2 className="text-2xl font-bold mb-2">📧 Recibe las mejores convocatorias cada jueves</h2>
          <p className="mb-6 opacity-90">Solo las relevantes para ONGs de LATAM.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Tu email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'white', color: '#CC0000' }}
              disabled={subscribeStatus === 'loading'}
            >
              {subscribeStatus === 'loading' ? 'Enviando...' : 'Suscribirme'}
            </button>
          </form>
          {subscribeMessage && (
            <p className="mt-4 font-medium">{subscribeMessage}</p>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Recursos para Postular</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">💡</span> Tips para Postular
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-[#CC0000] font-bold">1.</span>
                <span>Investiga profundamente antes de aplicar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#CC0000] font-bold">2.</span>
                <span>Destaca tu impacto medible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#CC0000] font-bold">3.</span>
                <span>Presupuesto realista y detallado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#CC0000] font-bold">4.</span>
                <span>Equipo diverso y capacitado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#CC0000] font-bold">5.</span>
                <span>Sé específico con el problema</span>
              </li>
            </ul>
          </div>
          
          <div className="card p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">📖</span> Glosario
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="font-semibold">Grant</dt>
                <dd className="text-sm" style={{ color: 'var(--text-secondary)' }}>Fondos no reembolsables</dd>
              </div>
              <div>
                <dt className="font-semibold">Deadline</dt>
                <dd className="text-sm" style={{ color: 'var(--text-secondary)' }}>Fecha límite para aplicar</dd>
              </div>
              <div>
                <dt className="font-semibold">Eligibility</dt>
                <dd className="text-sm" style={{ color: 'var(--text-secondary)' }}>Criterios de elegibilidad</dd>
              </div>
              <div>
                <dt className="font-semibold">NGO</dt>
                <dd className="text-sm" style={{ color: 'var(--text-secondary)' }}>Organización No Gubernamental</dd>
              </div>
            </dl>
          </div>
          
          <div className="card p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">❓</span> Preguntas Frecuentes
            </h3>
            <div className="space-y-4">
              <details className="group">
                <summary className="font-medium cursor-pointer list-none flex items-center justify-between">
                  ¿Qué es un grant?
                  <span className="transition-transform group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Un grant es un fondo no reembolsable. A diferencia de un préstamo, no necesitas devolverlo.
                </p>
              </details>
              <details className="group">
                <summary className="font-medium cursor-pointer list-none flex items-center justify-between">
                  ¿Puedo aplicar a varios grants?
                  <span className="transition-transform group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Sí, puedes aplicar a tantas convocatorias como quieras, siempre que cumplas los requisitos.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-8" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-bold text-lg mb-2">
            <span style={{ color: '#CC0000' }}>Grant</span>Hub Latam
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Tu directorio centralizado de convocatorias de grants en Latinoamérica
          </p>
          <p className="text-xs mt-4" style={{ color: 'var(--text-secondary)' }}>
            © 2025 GrantHub Latam. Todos los derechos reservados.
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
            Diseñado por <span className="font-semibold">Giovana M.</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
