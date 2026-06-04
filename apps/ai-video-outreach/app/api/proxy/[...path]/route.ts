import { NextRequest, NextResponse } from "next/server"

// Handle API_URL with or without protocol
const RAW_API_URL = process.env.API_URL || "api.chocomotion.agency"
const API_URL = RAW_API_URL.startsWith("http") ? RAW_API_URL : `https://${RAW_API_URL}`

// Server-side secret - never exposed to client
const API_SECRET = process.env.SECRET || ""

// Get API key: use provided header or fall back to server secret
// Only falls back to SECRET if header is completely absent (not just empty)
function getApiKey(request: NextRequest): string {
  const headerValue = request.headers.get("x-api-key")
  // If header exists (even if empty), use it - this allows admin auth to fail properly
  // If header is absent (null), use the server SECRET for server-side requests
  if (headerValue !== null) {
    return headerValue
  }
  return API_SECRET
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const apiPath = "/" + path.join("/")
  const searchParams = request.nextUrl.searchParams.toString()
  const url = `${API_URL}${apiPath}${searchParams ? `?${searchParams}` : ""}`
  
  const apiKey = getApiKey(request)

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
    })

    const data = await response.text()
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to connect to API", details: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const apiPath = "/" + path.join("/")
  const url = `${API_URL}${apiPath}`
  
  const apiKey = getApiKey(request)
  const body = await request.text()

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: body,
    })

    const data = await response.text()
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to connect to API", details: String(error) },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const apiPath = "/" + path.join("/")
  const url = `${API_URL}${apiPath}`
  
  const apiKey = getApiKey(request)
  const body = await request.text()

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: body,
    })

    const data = await response.text()
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to connect to API", details: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const apiPath = "/" + path.join("/")
  const url = `${API_URL}${apiPath}`
  
  const apiKey = getApiKey(request)

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "x-api-key": apiKey,
      },
    })

    const data = await response.text()
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to connect to API", details: String(error) },
      { status: 500 }
    )
  }
}
