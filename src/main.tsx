import { createRoot } from 'react-dom/client'
import './shadcn.css'
import App from './App'

// Função para renderizar em qualquer container
function renderLibrasBlog(containerId = 'app', config = {}) {
  const container = document.getElementById(containerId) || document.querySelector(containerId)
  
  if (container) {
    const root = createRoot(container)
    root.render(<App {...config} />)
  }
}

// Renderização padrão
const defaultContainer = document.getElementById('app')
if (defaultContainer) {
  renderLibrasBlog('app')
}

// Renderização para múltiplos containers (Elementor)
document.addEventListener('DOMContentLoaded', function() {
  const containers = document.querySelectorAll('[id^="libras-blog"]')
  containers.forEach((container, index) => {
    if (container.id !== 'app') {
      const config = {
        page: container.dataset.page || 'home',
        category: container.dataset.category || null,
        limit: parseInt(container.dataset.limit) || 10
      }
      renderLibrasBlog(`#${container.id}`, config)
    }
  })
})

// Exportar para uso global
window.LibrasBlogApp = { render: renderLibrasBlog }
