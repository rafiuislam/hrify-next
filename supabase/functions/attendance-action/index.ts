import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user's IP address
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     '127.0.0.1';

    console.log('Client IP:', clientIP);

    // Check if IP is whitelisted
    const { data: whitelist, error: whitelistError } = await supabaseClient
      .from('ip_whitelist')
      .select('*')
      .eq('ip_address', clientIP)
      .eq('is_active', true)
      .maybeSingle();

    if (whitelistError) {
      console.error('Whitelist check error:', whitelistError);
    }

    // For development, allow localhost IPs
    const isWhitelisted = whitelist || 
                         clientIP === '127.0.0.1' || 
                         clientIP === '::1' ||
                         clientIP.startsWith('192.168.') ||
                         clientIP.startsWith('10.') ||
                         clientIP === 'localhost';

    if (!isWhitelisted) {
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized location',
          message: 'You must be on the office network to check in/out',
          ip: clientIP
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { action, employeeId } = await req.json();
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (action === 'checkin') {
      // Check if already checked in today
      const { data: existing } = await supabaseClient
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .maybeSingle();

      if (existing && existing.check_in) {
        return new Response(
          JSON.stringify({ error: 'Already checked in today' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabaseClient
        .from('attendance')
        .insert({
          employee_id: employeeId,
          date: today,
          check_in: now.toISOString(),
          status: 'present'
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          success: true, 
          data,
          message: `Checked in at ${now.toLocaleTimeString()}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'checkout') {
      const { data: attendance } = await supabaseClient
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .is('check_out', null)
        .maybeSingle();

      if (!attendance) {
        return new Response(
          JSON.stringify({ error: 'No active check-in found for today' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate total hours
      const checkIn = new Date(attendance.check_in);
      const checkOut = now;
      const totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
      const overtime = Math.max(0, totalHours - 8);

      const { data, error } = await supabaseClient
        .from('attendance')
        .update({
          check_out: now.toISOString(),
          total_hours: Number(totalHours.toFixed(2)),
          overtime: Number(overtime.toFixed(2))
        })
        .eq('id', attendance.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          success: true, 
          data,
          message: `Checked out at ${now.toLocaleTimeString()}. Total hours: ${totalHours.toFixed(2)}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in attendance-action:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});