import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const checklist_completion_id = searchParams.get('checklist_completion_id')
  const work_order_id = searchParams.get('work_order_id')

  let query = supabase
    .from('pm_inspection_photos')
    .select('*')
    .order('created_at', { ascending: false })

  if (checklist_completion_id) {
    query = query.eq('checklist_completion_id', checklist_completion_id)
  }
  if (work_order_id) {
    query = query.eq('work_order_id', work_order_id)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const checklist_completion_id = formData.get('checklist_completion_id') as string | null
    const work_order_id = formData.get('work_order_id') as string | null
    const caption = formData.get('caption') as string | null
    const room_area = formData.get('room_area') as string | null
    const item_name = formData.get('item_name') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!checklist_completion_id && !work_order_id) {
      return NextResponse.json({ error: 'Must provide checklist_completion_id or work_order_id' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`
    const path = checklist_completion_id
      ? `checklists/${checklist_completion_id}/${filename}`
      : `work-orders/${work_order_id}/${filename}`

    // Upload to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer())
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('inspection-photos')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('inspection-photos')
      .getPublicUrl(path)

    // Save photo record to database
    const { data, error } = await supabase
      .from('pm_inspection_photos')
      .insert({
        checklist_completion_id: checklist_completion_id || null,
        work_order_id: work_order_id || null,
        photo_url: publicUrl,
        caption: caption || null,
        room_area: room_area || null,
        item_name: item_name || null
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Photo upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Photo ID required' }, { status: 400 })
  }

  // Get photo record first to get the URL
  const { data: photo, error: fetchError } = await supabase
    .from('pm_inspection_photos')
    .select('photo_url')
    .eq('id', id)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  // Extract path from URL and delete from storage
  if (photo?.photo_url) {
    const url = new URL(photo.photo_url)
    const pathMatch = url.pathname.match(/\/inspection-photos\/(.+)$/)
    if (pathMatch) {
      await supabase.storage.from('inspection-photos').remove([pathMatch[1]])
    }
  }

  // Delete database record
  const { error } = await supabase
    .from('pm_inspection_photos')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
