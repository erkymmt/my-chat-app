import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">チャットアプリへようこそ</h1>
      <Link 
        href="/chat" 
        className="bg-blue-500 text-white px-8 py-4 rounded-lg text-xl hover:bg-blue-600 transition-colors"
      >
        チャットを始める
      </Link>
    </main>
  )
} 