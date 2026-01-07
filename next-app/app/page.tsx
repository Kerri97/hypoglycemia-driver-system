'use client'
import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('@/app/components/Scene'), {
    ssr: false,
    loading: () => <p>Loading...</p>,
})

export default function Home() {
    return (
        <main className='relative h-screen'>
            <Scene />
        </main>
    )
} 
