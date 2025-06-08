import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { googleAvatarUrl, userId } = await request.json();
    
    if (!googleAvatarUrl || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Verify the user is authenticated and matches the userId
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the image from Google with better headers
    const response = await fetch(googleAvatarUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch Google image:', response.status, response.statusText);
      return NextResponse.json({ 
        error: 'Failed to fetch image from Google',
        originalUrl: googleAvatarUrl 
      }, { status: response.status });
    }
    
    const blob = await response.blob();
    const fileExtension = blob.type.split('/')[1] || 'jpg';
    const fileName = `${userId}/avatar.${fileExtension}`;
    
    // Convert blob to array buffer for Supabase
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, uint8Array, {
        contentType: blob.type,
        upsert: true
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ 
        error: 'Failed to upload to storage',
        originalUrl: googleAvatarUrl 
      }, { status: 500 });
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    return NextResponse.json({ 
      success: true, 
      avatarUrl: publicUrlData.publicUrl 
    });
    
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}