import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Get ImageKit Private Key
    const rawKey = Deno.env.get('IMAGEKIT_PRIVATE_KEY')
    if (!rawKey) {
      throw new Error('IMAGEKIT_PRIVATE_KEY secret is not set')
    }
    const privateKey = rawKey.trim()

    // 2. Parse request body
    const body = await req.json()
    const { fileId } = body
    if (!fileId) {
      throw new Error('fileId is required')
    }

    console.log(`Attempting to delete fileId: ${fileId}`)

    // 3. Delete from ImageKit using v1 API
    // Auth: Basic <base64(privateKey:)>
    const authHeader = `Basic ${btoa(privateKey + ':')}`
    
    const response = await fetch(`https://api.imagekit.io/v2/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
      },
    })

    if (!response.ok && response.status !== 404) {
      const errorBody = await response.text()
      console.error(`ImageKit API error (${response.status}):`, errorBody)
      return new Response(
        JSON.stringify({ error: `ImageKit API error: ${errorBody}`, status: response.status }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      )
    }

    console.log(`Successfully deleted fileId: ${fileId} (or already deleted)`)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('imagekit-delete error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
