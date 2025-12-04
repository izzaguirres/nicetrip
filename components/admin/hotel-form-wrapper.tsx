"use client"

import { useRouter } from 'next/navigation'
import { HotelForm } from './hotel-form'

interface WrapperProps {
  // Recebe null ou dados de DIÁRIA (não dados de hotel)
  initialData?: any 
}

export function HotelFormWrapper({ initialData }: WrapperProps) {
  const router = useRouter()

  return (
    <HotelForm 
      initialData={initialData}
      onSuccess={() => {
        router.refresh()
      }} 
      onCancel={() => {
        router.back()
      }} 
    />
  )
}
