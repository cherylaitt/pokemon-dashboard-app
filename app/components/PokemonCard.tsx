'use client'

import { useState, useEffect, useCallback } from 'react'
import LoadingSpinner from './LoadingSpinner'
import styles from './PokemonCard.module.css'
import Image from 'next/image'

interface PokemonCardProps {
  pokemon: {
    name: string
    url: string
  }
  index: number
  pokemonDetails?: {
    id: number
    name: string
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
  onClick?: () => void
}

interface PokemonDetails {
  id: number
  name: string
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

export default function PokemonCard({ pokemon, index, pokemonDetails: providedDetails, onClick }: PokemonCardProps) {
  const [details, setDetails] = useState<PokemonDetails | null>(providedDetails || null)
  const [loading, setLoading] = useState(!providedDetails)
  const [error, setError] = useState<string | null>(null)

  const fetchDetails = useCallback(async () => {
    // If details are provided, use them directly
    if (providedDetails) {
      setDetails(providedDetails)
      setLoading(false)
      setError(null)
      return
    }

    // Otherwise, fetch details
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(pokemon.url)
      if (response.ok) {
        const data: PokemonDetails = await response.json()
        setDetails(data)
      } else {
        throw new Error('Failed to load Pokemon details')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load Pokemon details')
    } finally {
      setLoading(false)
    }
  }, [pokemon.url, providedDetails])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  const getTypeColor = (typeName: string) => {
    const colors: Record<string, string> = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC',
    }
    return colors[typeName] || '#68A090'
  }

  const formatName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="small" />
        </div>
      </div>
    )
  }

  if (error && !details) {
    return (
      <div className={styles.card}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorMessage}>Unable to load Pokemon</p>
          <button className={styles.retryButton} onClick={fetchDetails}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!details) {
    return null
  }

  const imageUrl =
    details.sprites.other['official-artwork'].front_default ||
    details.sprites.front_default ||
    ''

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={formatName(details.name)}
            className={styles.image}
            width={100}
            height={100}
          />
        ) : (
          <div className={styles.placeholder}>#{details.id}</div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.name}>{formatName(details.name)}</h3>
          <span className={styles.id}>#{details.id.toString().padStart(3, '0')}</span>
        </div>
        <div className={styles.types}>
          {details.types.map((type) => (
            <span
              key={type.type.name}
              className={styles.type}
              style={{ backgroundColor: getTypeColor(type.type.name) }}
            >
              {formatName(type.type.name)}
            </span>
          ))}
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Height</span>
            <span className={styles.statValue}>{(details.height / 10).toFixed(1)}m</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Weight</span>
            <span className={styles.statValue}>{(details.weight / 10).toFixed(1)}kg</span>
          </div>
        </div>
      </div>
    </div>
  )
}
