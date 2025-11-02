import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      name, 
      email, 
      phone, 
      department, 
      position, 
      address,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship 
    } = await req.json();

    console.log('Registering employee:', { name, email });

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Create employee record with pending status
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .insert({
        user_id: user.id,
        name,
        email,
        phone,
        department,
        position,
        address,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relationship,
        status: 'pending'
      })
      .select()
      .single();

    if (employeeError) {
      console.error('Error creating employee:', employeeError);
      throw employeeError;
    }

    // Assign employee role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        role: 'employee'
      });

    if (roleError) {
      console.error('Error assigning role:', roleError);
    }

    console.log('Employee registered successfully:', employee.id);

    return new Response(
      JSON.stringify({ success: true, employee }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in employee-register:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});