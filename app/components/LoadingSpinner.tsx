'use client'

import styles from './LoadingSpinner.module.css'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  text?: string
  whiteText?: boolean
  whiteSpinner?: boolean
}

export default function LoadingSpinner({ size = 'medium', text, whiteText = false, whiteSpinner = false }: LoadingSpinnerProps) {
  return (
    <div className={styles.container}>
      <div className={`${styles.spinner} ${styles[size]} ${whiteSpinner ? styles.white : ''}`}></div>
      {text && <p className={`${styles.text} ${whiteText ? styles.white : ''}`}>{text}</p>}
    </div>
  )
}
