import Link from 'next/link'
import styles from './style.module.css'

export default function Other() {
  return (
    <main>
      <h1 className={styles.title}> Other page </h1>
      <p className={styles.msg}> This is other page.</p>
      <div>
        <Link href="/">go back</Link>
      </div>
      </main>
  )
}
