'use client'

import { useEffect, useState } from 'react'
import LoadingSpinner from './LoadingSpinner'
import styles from './PokemonDetailsModal.module.css'
import Image from 'next/image'

interface PokemonDetailsModalProps {
  pokemonUrl: string | null
  onClose: () => void
}

interface FullPokemonDetails {
  id: number
  name: string
  base_experience: number
  height: number
  weight: number
  abilities: Array<{
    ability: {
      name: string
    }
    is_hidden: boolean
  }>
  stats: Array<{
    base_stat: number
    stat: {
      name: string
    }
  }>
  types: Array<{
    type: {
      name: string
    }
  }>
  sprites: {
    front_default: string
    back_default: string
    other: {
      'official-artwork': {
        front_default: string
      }
      dream_world: {
        front_default: string
      }
    }
  }
  moves: Array<{
    move: {
      name: string
    }
  }>
}

export default function PokemonDetailsModal({ pokemonUrl, onClose }: PokemonDetailsModalProps) {
  const [details, setDetails] = useState<FullPokemonDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetails = async () => {
    if (!pokemonUrl) {
      setDetails(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await fetch(pokemonUrl)
      
      if (!response.ok) {
        throw new Error('Unable to load Pokemon details. Please check your connection and try again.')
      }
      
      const data: FullPokemonDetails = await response.json()
      setDetails(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while loading Pokemon details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetails()
  }, [pokemonUrl])

  const formatName = (name: string) => {
    return name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

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

  const formatStatName = (statName: string) => {
    return statName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (!pokemonUrl) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        {loading && (
          <div className={styles.loadingContainer}>
            <LoadingSpinner size="large" text="Loading Pokemon details..." />
          </div>
        )}

        {error && !loading && (
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <h3 className={styles.errorTitle}>Unable to Load Details</h3>
            <p className={styles.errorMessage}>{error}</p>
            <button className={styles.retryButton} onClick={fetchDetails}>
              Try Again
            </button>
          </div>
        )}

        {details && !loading && (
          <div className={styles.content}>
            <div className={styles.header}>
              <div className={styles.imageContainer}>
                <Image
                  src={
                    details.sprites.other['official-artwork'].front_default ||
                    details.sprites.other.dream_world.front_default ||
                    details.sprites.front_default ||
                    ''
                  }
                  alt={formatName(details.name)}
                  className={styles.mainImage}
                  width={100}
                  height={100}
                />
              </div>
              <div className={styles.titleSection}>
                <h2 className={styles.name}>{formatName(details.name)}</h2>
                <span className={styles.id}>#{details.id.toString().padStart(3, '0')}</span>
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
              </div>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Basic Info</h3>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Height:</span>
                  <span className={styles.infoValue}>{(details.height / 10).toFixed(1)}m</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Weight:</span>
                  <span className={styles.infoValue}>{(details.weight / 10).toFixed(1)}kg</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Base Experience:</span>
                  <span className={styles.infoValue}>{details.base_experience}</span>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Abilities</h3>
                <div className={styles.abilitiesList}>
                  {details.abilities.map((ability, index) => (
                    <div key={index} className={styles.ability}>
                      {formatName(ability.ability.name)}
                      {ability.is_hidden && (
                        <span className={styles.hiddenBadge}>Hidden</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Base Stats</h3>
                <div className={styles.statsList}>
                  {details.stats.map((stat, index) => (
                    <div key={index} className={styles.statRow}>
                      <span className={styles.statName}>
                        {formatStatName(stat.stat.name)}:
                      </span>
                      <div className={styles.statBarContainer}>
                        <div
                          className={styles.statBar}
                          style={{
                            width: `${Math.min((stat.base_stat / 255) * 100, 100)}%`,
                            backgroundColor: stat.base_stat >= 100 ? '#4CAF50' : stat.base_stat >= 70 ? '#FFC107' : '#FF9800',
                          }}
                        />
                      </div>
                      <span className={styles.statValue}>{stat.base_stat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Moves ({details.moves.length})</h3>
                <div className={styles.movesList}>
                  {details.moves.slice(0, 15).map((move, index) => (
                    <span key={index} className={styles.move}>
                      {formatName(move.move.name)}
                    </span>
                  ))}
                  {details.moves.length > 20 && (
                    <span className={styles.moreMoves}>
                      +{details.moves.length - 15} more moves
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
