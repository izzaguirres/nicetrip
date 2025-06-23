"use client"

import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [errors, setErrors] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Capturar erros globais
    const handleError = (event: ErrorEvent) => {
      setErrors(prev => [...prev, `Error: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`])
    }

    window.addEventListener('error', handleError)

    // Verificar se as imagens estão carregando
    const checkImages = () => {
      const images = document.querySelectorAll('img')
      images.forEach(img => {
        if (!img.complete || img.naturalHeight === 0) {
          setErrors(prev => [...prev, `Image failed to load: ${img.src}`])
        }
      })
    }

    setTimeout(checkImages, 1000)

    return () => {
      window.removeEventListener('error', handleError)
    }
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      <div className="mb-4">
        <p>Mounted: {mounted ? 'Yes' : 'No'}</p>
        <p>Window exists: {typeof window !== 'undefined' ? 'Yes' : 'No'}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Test Components:</h2>
        
        {/* Test Select */}
        <div className="mb-2">
          <label>Test Select:</label>
          <select className="border p-2">
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </div>

        {/* Test Image */}
        <div className="mb-2">
          <label>Test Image:</label>
          <img 
            src="/images/nice-trip-logo-new.png" 
            alt="Logo" 
            className="h-20"
            onError={(e) => setErrors(prev => [...prev, `Image error: ${e.currentTarget.src}`])}
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Errors:</h2>
        {errors.length === 0 ? (
          <p className="text-green-600">No errors detected</p>
        ) : (
          <ul className="list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index} className="text-red-600">{error}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
} 