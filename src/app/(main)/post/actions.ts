'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createQuest(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const lat = parseFloat(formData.get('lat') as string)
  const lng = parseFloat(formData.get('lng') as string)
  const locationName = formData.get('locationName') as string
  const rewardType = formData.get('rewardType') as string || 'points'
  const price = parseFloat(formData.get('price') as string) || 0
  const photoUrl = formData.get('photoUrl') as string || null

  const { error } = await supabase.from('quests').insert({
    created_by: user.id,
    title,
    description,
    category,
    lat,
    lng,
    w3w_address: locationName,
    reward_type: rewardType,
    price,
    photo_url: photoUrl,
    status: 'open',
  })

  if (error) {
    console.error('Error creating quest:', error)
    redirect('/post?message=' + encodeURIComponent(error.message))
  }

  redirect('/browse?message=Quest posted successfully!')
}
