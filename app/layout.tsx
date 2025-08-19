import './globals.css'
import '../styles/style.css'

export const metadata = {
  title: 'Villas Catalog & Calculator',
  description: 'Unified admin + catalog + calculator'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}