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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { employee_id, action, salary } = await req.json();

    console.log('Processing approval:', { employee_id, action });

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

    // Check if user is admin or HR
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdminOrHR = roles?.some(r => r.role === 'admin' || r.role === 'hr');
    
    if (!isAdminOrHR) {
      throw new Error('Unauthorized: Only admins and HR can approve employees');
    }

    // Update employee status
    const newStatus = action === 'approve' ? 'active' : 'rejected';
    const updateData: any = { status: newStatus };
    
    if (action === 'approve' && salary) {
      updateData.salary = salary;
    }

    const { data: employee, error: updateError } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', employee_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating employee:', updateError);
      throw updateError;
    }

    console.log('Employee status updated:', employee.id, newStatus);

    return new Response(
      JSON.stringify({ success: true, employee }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in employee-approval:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});