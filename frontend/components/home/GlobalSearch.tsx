'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2, ArrowRight } from 'lucide-react'
import api from '@/lib/api'

interface Test {
  _id: string
  name: string
  category: string
  price?: number
  originalPrice?: number
  offerPrice?: number
}

const commonTests = [
  'CBP', 'Thyroid', 'Vitamin', 'Glucose', 'LFT', 'MRI', 'CT Scan',
  'HbA1c', 'Lipid Profile', 'TSH', 'CRP', 'ESR',
]

interface GlobalSearchProps {
  placeholder?: string
  className?: string
  compact?: boolean
}

export default function GlobalSearch({
  placeholder = 'Search tests: CBP, Thyroid, Vitamin, Glucose, LFT, MRI, CT Scan...',
  className = '',
  compact = false,
}: GlobalSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<Test[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const res = await api.get(`/tests?search=${encodeURIComponent(q)}&limit=10`)
      const data = res.data?.tests || res.data || []
      setResults(Array.isArray(data) ? data : [])
    } catch {
      setResults([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(() => fetchResults(query), 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, fetchResults])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(prev => Math.min(prev + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(prev => Math.max(prev - 1, -1)) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && results[selectedIndex]) {
        router.push(`/booking?test=${results[selectedIndex]._id}`)
        setIsOpen(false); setQuery('')
      } else if (query.trim()) {
        router.push(`/tests?search=${encodeURIComponent(query)}`)
        setIsOpen(false); setQuery('')
      }
    }
    else if (e.key === 'Escape') setIsOpen(false)
  }

  const displayPrice = (test: Test) => test.offerPrice ?? test.originalPrice ?? test.price ?? 0

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div className={`relative flex items-center rounded-2xl border border-gray-200 bg-white transition-all duration-150 focus-within:border-[#14B8A6] focus-within:shadow-[#14B8A6]/10 ${compact ? 'shadow-sm' : 'shadow-xl shadow-gray-200/50'}`}>
        <Search className={`absolute left-4 text-gray-400 ${compact ? 'h-4 w-4' : 'h-5 w-5 left-5'}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); setSelectedIndex(-1) }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 ${compact ? 'py-3 pl-11 pr-10 text-sm' : 'pl-14 pr-12 py-4 text-base'}`}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
            className="absolute right-3 rounded-lg p-1.5 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50"
          >
            {!query && (
              <div className="p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Popular Searches</p>
                <div className="flex flex-wrap gap-2">
                  {commonTests.map((test) => (
                    <button
                      key={test}
                      onClick={() => { setQuery(test); setIsOpen(true); fetchResults(test) }}
                      className="rounded-lg bg-[#1BAE9A]/5 px-3 py-1.5 text-sm font-medium text-[#1BAE9A] transition-colors duration-150 hover:bg-[#1BAE9A]/10"
                    >
                      {test}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="max-h-72 overflow-y-auto border-t border-gray-50">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-[#1BAE9A]" />
                  <span className="ml-2 text-sm text-gray-400">Searching...</span>
                </div>
              ) : results.length > 0 ? (
                results.map((test, i) => (
                  <button
                    key={test._id}
                    onClick={() => { router.push(`/booking?test=${test._id}`); setIsOpen(false); setQuery('') }}
                    className={`flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors duration-150 ${selectedIndex === i ? 'bg-[#1BAE9A]/5' : 'hover:bg-gray-50'}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{test.name}</p>
                      <p className="text-xs capitalize text-gray-400">{test.category}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#1BAE9A]">Rs. {displayPrice(test)}</span>
                      <ArrowRight className="h-4 w-4 text-gray-300" />
                    </div>
                  </button>
                ))
              ) : query.trim() ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Search className="mb-2 h-10 w-10 text-gray-200" />
                  <p className="text-sm text-gray-400">No tests found for &ldquo;{query}&rdquo;</p>
                  <p className="mt-1 text-xs text-gray-300">Try a different search term</p>
                </div>
              ) : null}
            </div>

            {results.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-100 p-3">
                <span className="text-xs text-gray-400">{results.length} results</span>
                <button
                  onClick={() => { router.push(`/tests?search=${encodeURIComponent(query)}`); setIsOpen(false) }}
                  className="text-xs font-medium text-[#1BAE9A] hover:underline"
                >
                  View all
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
