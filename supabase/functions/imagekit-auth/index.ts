import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/** Base64Url encode a Uint8Array (no padding, URL-safe charset) */
function base64UrlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const rawKey = Deno.env.get('IMAGEKIT_PRIVATE_KEY')
    if (!rawKey) {
      throw new Error('IMAGEKIT_PRIVATE_KEY secret is not set')
    }
    const privateAPIKey = rawKey.trim()

    const rawPublicKey = Deno.env.get('IMAGEKIT_PUBLIC_KEY')
    if (!rawPublicKey) {
      throw new Error('IMAGEKIT_PUBLIC_KEY secret is not set')
    }
    const imagekitPublicKey = rawPublicKey.trim()

    // Read upload params from client request body.
    // The client sends the exact upload params that need to be signed into the JWT.
    // ImageKit V2 requires: every param in the JWT payload must also be sent as
    // a FormData field with the EXACT same value. Values must be strings (except iat, exp).
    let uploadParams: Record<string, string> = {}
    try {
      const body = await req.json()
      uploadParams = body?.uploadParams || {}
    } catch (_) {
      // No body or not JSON
    }

    if (!uploadParams.fileName) {
      throw new Error('uploadParams.fileName is required')
    }

    const now = Math.floor(Date.now() / 1000)
    const exp = now + 3600 // max allowed by ImageKit: 1 hour

    // --- JWT Header: must include kid = ImageKit public key ---
    const header = { alg: 'HS256', typ: 'JWT', kid: imagekitPublicKey }
    const headerEncoded = base64UrlEncode(
      new TextEncoder().encode(JSON.stringify(header))
    )

    // --- JWT Payload ---
    // Contains iat, exp, and ALL upload parameters (as strings).
    // These must EXACTLY match the FormData fields the client sends to ImageKit.
    const payload: Record<string, any> = {
      iat: now,
      exp: exp,
      ...uploadParams, // fileName, useUniqueFileName, folder, etc. — all as strings
    }

    const payloadEncoded = base64UrlEncode(
      new TextEncoder().encode(JSON.stringify(payload))
    )

    // --- Sign with HMAC-SHA256 using the private key ---
    const signingInput = `${headerEncoded}.${payloadEncoded}`
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(privateAPIKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      new TextEncoder().encode(signingInput)
    )

    const signatureEncoded = base64UrlEncode(new Uint8Array(signatureBuffer))
    const jwt = `${headerEncoded}.${payloadEncoded}.${signatureEncoded}`

    console.log(`Generated JWT for fileName="${uploadParams.fileName}", exp=${exp}`)

    return new Response(
      JSON.stringify({ token: jwt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('imagekit-auth error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
