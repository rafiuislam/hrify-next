-- Create enum for employee status
CREATE TYPE public.employee_status AS ENUM ('pending', 'active', 'rejected');

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'hr', 'employee');

-- Create employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  date_of_joining DATE DEFAULT CURRENT_DATE,
  salary NUMERIC(10, 2),
  status employee_status DEFAULT 'pending',
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table for role-based access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create employee_documents table
CREATE TABLE public.employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's employee record
CREATE OR REPLACE FUNCTION public.get_employee_by_user_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.employees WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for employees table

-- Anyone can insert (for self-registration)
CREATE POLICY "Anyone can register as employee"
ON public.employees
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admins and HR can view all employees
CREATE POLICY "Admins and HR can view all employees"
ON public.employees
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'hr')
);

-- Employees can view their own record
CREATE POLICY "Employees can view own record"
ON public.employees
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins and HR can update employees
CREATE POLICY "Admins and HR can update employees"
ON public.employees
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'hr')
);

-- Employees can update their own non-sensitive fields
CREATE POLICY "Employees can update own profile"
ON public.employees
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() AND
  -- Prevent updating sensitive fields
  status = (SELECT status FROM public.employees WHERE id = employees.id) AND
  salary = (SELECT salary FROM public.employees WHERE id = employees.id) AND
  department = (SELECT department FROM public.employees WHERE id = employees.id)
);

-- Only admins can delete employees
CREATE POLICY "Only admins can delete employees"
ON public.employees
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles table

-- Only admins can view roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Only admins can insert roles
CREATE POLICY "Only admins can assign roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update roles
CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete roles
CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for employee_documents table

-- Admins and HR can view all documents
CREATE POLICY "Admins and HR can view all documents"
ON public.employee_documents
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'hr')
);

-- Employees can view their own documents
CREATE POLICY "Employees can view own documents"
ON public.employee_documents
FOR SELECT
TO authenticated
USING (
  employee_id = public.get_employee_by_user_id(auth.uid())
);

-- Admins, HR, and employees can upload documents
CREATE POLICY "Authenticated users can upload documents"
ON public.employee_documents
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'hr') OR
  employee_id = public.get_employee_by_user_id(auth.uid())
);

-- Admins and HR can delete documents
CREATE POLICY "Admins and HR can delete documents"
ON public.employee_documents
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'hr')
);

-- Create trigger for updated_at
CREATE TRIGGER set_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for employee documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('employee-documents', 'employee-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for employee documents bucket
CREATE POLICY "Admins and HR can view all employee documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'employee-documents' AND
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'))
);

CREATE POLICY "Employees can view own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'employee-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated users can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'employee-documents' AND
  (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'hr') OR
    (storage.foldername(name))[1] = auth.uid()::text
  )
);

CREATE POLICY "Admins and HR can delete employee documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'employee-documents' AND
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr'))
);