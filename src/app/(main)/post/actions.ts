'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createQuest(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const lat = parseFloat(formData.get('lat') as string)
  const lng = parseFloat(formData.get('lng') as string)
  const locationName = formData.get('locationName') as string
  const rewardType = formData.get('rewardType') as string || 'points'
  const price = parseFloat(formData.get('price') as string) || 0

  // Validate lat/lng
  if (isNaN(lat) || isNaN(lng)) {
    redirect('/post?message=' + encodeURIComponent('Please select a valid location from the suggestions.'))
  }

  // Upload photo to Supabase Storage if provided
  let photoUrl: string | null = null
  const photoFile = formData.get('photo') as File | null
  if (photoFile && photoFile.size > 0) {
    const ext = photoFile.name.split('.').pop() || 'jpg'
    const path = `${user.id}/${Date.now()}.${ext}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('quest-photos')
      .upload(path, photoFile, { upsert: true })

    if (!uploadError && uploadData) {
      const { data: { publicUrl } } = supabase.storage
        .from('quest-photos')
        .getPublicUrl(uploadData.path)
      
      // Store as a relative proxy URL so the browser loads it correctly from any domain
      photoUrl = publicUrl.replace(process.env.SUPABASE_URL || 'http://localhost:54321', '/supabase')
    }
  }

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

  redirect('/browse')
}

export async function acceptQuest(questId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('quests')
    .update({ status: 'active', adventurer_id: user.id })
    .eq('id', questId)
    .eq('status', 'open') // Only can accept open quests

  if (error) {
    console.error('Accept quest error:', error)
  }
  // Also record the interaction
  await supabase.from('quest_interactions').insert({
    quest_id: questId,
    adventurer_id: user.id,
    status: 'pending_approval',
  })
}
