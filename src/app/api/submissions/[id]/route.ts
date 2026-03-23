/**
 * Get individual submission by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();
  
  const supabase = createClient();
  
  const updates: Record<string, unknown> = {};
  
  if (body.aiAnalysis) {
    updates.ai_analysis = body.aiAnalysis;
  }
  if (body.paid !== undefined) {
    updates.paid = body.paid;
  }
  
  const { error } = await supabase
    .from('submissions')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
}
