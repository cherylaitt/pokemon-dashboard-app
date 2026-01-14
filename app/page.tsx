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
  const [allPokemonDetails, setAllPokemonDetails] = useState<PokemonDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPokemonUrl, setSelectedPokemonUrl] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const itemsPerPage = 20

  const fetchPokemon = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=50');
      
      if (!response.ok) {
        throw new Error(`Unable to load Pokemon. Please check your connection and try again.`)
      }
      
      const data: PokemonResponse = await response.json();
      setPokemon(data.results);
      setError(null);
      setLoadingDetails(true);
      
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

      const details = await Promise.all(detailsPromises);
      setAllPokemonDetails(details.filter((d): d is PokemonDetails => d !== null));
      setLoadingDetails(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while loading Pokemon.');
      setLoadingDetails(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPokemon()
  }, []);

  useEffect(() => {
    setPage(1)
  }, [searchQuery]);

  const filteredPokemon = useMemo(() => {
    if (!searchQuery.trim()) {
      return allPokemonDetails;
    };

    const query = searchQuery.toLowerCase().trim()
    return allPokemonDetails.filter((poke) => {
      const nameMatch = poke.name.toLowerCase().includes(query)
      const typeMatch = poke.types.some((type) =>
        type.type.name.toLowerCase().includes(query)
      )
      return nameMatch || typeMatch
    })
  }, [allPokemonDetails, searchQuery])

  const paginatedPokemon = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return filteredPokemon.slice(startIndex, endIndex);
  }, [filteredPokemon, page, itemsPerPage]);

  const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" text="Loading Pokemon..." whiteText whiteSpinner />
        </div>
      </div>
    );
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
        <h1 className={styles.title}>Pokemon</h1>
      </header>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      {loadingDetails && allPokemonDetails.length === 0 ? (
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" text="Loading Pokemon details..." whiteText whiteSpinner />
        </div>
      ) : (
        <div className={styles.dashboardContainer}>
          <div className={styles.dashboard}>
            {paginatedPokemon.length > 0 ? (
              paginatedPokemon.map((poke) => (
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
          <br/>
          
          {filteredPokemon.length > 0 && totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                className={styles.paginationButton} 
                onClick={() => setPage(Math.max(page - 1, 1))} 
                disabled={page === 1}
              >
                Previous
              </button>
              <span className={styles.paginationPage}>
                Page {page} of {totalPages} ({filteredPokemon.length} {searchQuery ? 'found' : 'total'})
              </span>
              <button 
                className={styles.paginationButton} 
                onClick={() => setPage(Math.min(page + 1, totalPages))} 
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
          <br/>
        </div>
      )}
      <PokemonDetailsModal
        pokemonUrl={selectedPokemonUrl}
        onClose={() => setSelectedPokemonUrl(null)}
      />
    </div>
  )
}
