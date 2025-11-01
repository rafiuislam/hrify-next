-- Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  total_hours DECIMAL(5,2) DEFAULT 0,
  overtime DECIMAL(5,2) DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'half-day')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create IP whitelist table
CREATE TABLE IF NOT EXISTS public.ip_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON public.attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.attendance(status);

-- Enable Row Level Security
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_whitelist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attendance (allow all authenticated users for now)
CREATE POLICY "Allow authenticated users to view attendance"
  ON public.attendance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert attendance"
  ON public.attendance FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update attendance"
  ON public.attendance FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for IP whitelist (read-only for authenticated users)
CREATE POLICY "Allow authenticated users to view IP whitelist"
  ON public.ip_whitelist FOR SELECT
  TO authenticated
  USING (true);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for attendance updated_at
CREATE TRIGGER set_attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for attendance table
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;

-- Insert some default whitelisted IPs
INSERT INTO public.ip_whitelist (ip_address, description) VALUES
  ('127.0.0.1', 'Localhost'),
  ('::1', 'Localhost IPv6')
ON CONFLICT (ip_address) DO NOTHING;