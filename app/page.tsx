'use client'

import { useEffect, useState, useMemo } from 'react'
import PokemonCard from './components/PokemonCard'
import PokemonDetailsModal from './components/PokemonDetailsModal'
import LoadingSpinner from './components/LoadingSpinner'
import styles from './page.module.css'

interface Pokemon {
  name: string
  url: string
}

interface PokemonResponse {
  count: number
  next: string | null
  previous: string | null
  results: Pokemon[]
}

interface PokemonDetails {
  id: number
  name: string
  url: string
  sprites: {
    front_default: string
    other: {
      'official-artwork': {
        front_default: string
      }
    }
  }
  types: Array<{
    type: {
      name: string
    }
  }>
  height: number
  weight: number
}

export default function Home() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [pokemonDetails, setPokemonDetails] = useState<PokemonDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPokemonUrl, setSelectedPokemonUrl] = useState<string | null>(null)

  const fetchPokemon = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=50')
      
      if (!response.ok) {
        throw new Error(`Unable to load Pokemon. Please check your connection and try again.`)
      }
      
      const data: PokemonResponse = await response.json()
      setPokemon(data.results)
      setError(null)

      // Fetch details for all Pokemon
      setLoadingDetails(true)
      const detailsPromises = data.results.map(async (poke) => {
        try {
          const detailResponse = await fetch(poke.url)
          if (detailResponse.ok) {
            const detailData: PokemonDetails = await detailResponse.json()
            return { ...detailData, url: poke.url }
          }
          return null
        } catch {
          return null
        }
      })

      const details = await Promise.all(detailsPromises)
      setPokemonDetails(details.filter((d): d is PokemonDetails => d !== null))
      setLoadingDetails(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while loading Pokemon.')
      setLoadingDetails(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPokemon()
  }, [])

  const filteredPokemon = useMemo(() => {
    if (!searchQuery.trim()) {
      return pokemonDetails
    }

    const query = searchQuery.toLowerCase().trim()
    return pokemonDetails.filter((poke) => {
      const nameMatch = poke.name.toLowerCase().includes(query)
      const typeMatch = poke.types.some((type) =>
        type.type.name.toLowerCase().includes(query)
      )
      return nameMatch || typeMatch
    })
  }, [pokemonDetails, searchQuery])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" text="Loading Pokemon..." whiteText whiteSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>Oops! Something went wrong</h2>
          <p className={styles.errorMessage}>{error}</p>
          <button className={styles.retryButton} onClick={fetchPokemon}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Pokemon Dashboard</h1>
        <p className={styles.subtitle}>
          Discover {filteredPokemon.length} of {pokemonDetails.length} amazing Pokemon
        </p>
      </header>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by name or type (e.g., pikachu, fire, water)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      {loadingDetails && pokemonDetails.length === 0 ? (
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" text="Loading Pokemon details..." whiteText whiteSpinner />
        </div>
      ) : (
        <div className={styles.dashboard}>
          {filteredPokemon.length > 0 ? (
            filteredPokemon.map((poke) => (
              <PokemonCard
                key={poke.name}
                pokemon={{ name: poke.name, url: poke.url }}
                pokemonDetails={poke}
                index={poke.id}
                onClick={() => setSelectedPokemonUrl(poke.url)}
              />
            ))
          ) : (
            <div className={styles.noResults}>
              No Pokemon found matching "{searchQuery}"
            </div>
          )}
        </div>
      )}
      <PokemonDetailsModal
        pokemonUrl={selectedPokemonUrl}
        onClose={() => setSelectedPokemonUrl(null)}
      />
    </div>
  )
}
