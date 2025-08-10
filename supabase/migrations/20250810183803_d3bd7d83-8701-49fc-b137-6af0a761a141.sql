-- Create enum for consultation types
CREATE TYPE public.consultation_type AS ENUM (
  'consulta_geral',
  'vacinacao',
  'cirurgia_pequeno_porte',
  'cirurgia_grande_porte',
  'exame_laboratorial',
  'banho_tosa',
  'emergencia'
);

-- Create enum for appointment status
CREATE TYPE public.appointment_status AS ENUM (
  'agendado',
  'confirmado',
  'em_andamento',
  'concluido',
  'cancelado'
);

-- Create consultation types table with duration
CREATE TABLE public.consultation_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type consultation_type NOT NULL UNIQUE,
  duration_minutes INTEGER NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_name TEXT NOT NULL,
  tutor_phone TEXT NOT NULL,
  tutor_email TEXT,
  pet_name TEXT NOT NULL,
  pet_species TEXT NOT NULL,
  pet_breed TEXT,
  pet_age INTEGER,
  pet_weight_grams INTEGER NOT NULL, -- Weight in grams
  consultation_type consultation_type NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  end_time TIME NOT NULL, -- Calculated automatically
  status appointment_status NOT NULL DEFAULT 'agendado',
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure no overlapping appointments
  CONSTRAINT unique_time_slot EXCLUDE USING gist (
    appointment_date WITH =,
    tsrange(appointment_time::text::time, end_time::text::time, '[)') WITH &&
  ) WHERE (status != 'cancelado')
);

-- Enable Row Level Security
ALTER TABLE public.consultation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for consultation_types (read-only for everyone)
CREATE POLICY "Anyone can view consultation types" 
ON public.consultation_types 
FOR SELECT 
USING (true);

-- Create policies for appointments (anyone can create, view their own)
CREATE POLICY "Anyone can create appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view all appointments" 
ON public.appointments 
FOR SELECT 
USING (true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_consultation_types_updated_at
  BEFORE UPDATE ON public.consultation_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically calculate end_time based on consultation type
CREATE OR REPLACE FUNCTION public.calculate_appointment_end_time()
RETURNS TRIGGER AS $$
DECLARE
  duration_mins INTEGER;
BEGIN
  -- Get duration for the consultation type
  SELECT duration_minutes INTO duration_mins
  FROM public.consultation_types
  WHERE type = NEW.consultation_type;
  
  -- Calculate end time
  NEW.end_time = (NEW.appointment_time::interval + (duration_mins || ' minutes')::interval)::time;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate end_time
CREATE TRIGGER calculate_end_time_trigger
  BEFORE INSERT OR UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_appointment_end_time();

-- Insert default consultation types
INSERT INTO public.consultation_types (name, type, duration_minutes, description, price) VALUES
('Consulta Geral', 'consulta_geral', 30, 'Consulta veterinária de rotina', 80.00),
('Vacinação', 'vacinacao', 15, 'Aplicação de vacinas', 45.00),
('Cirurgia Pequeno Porte', 'cirurgia_pequeno_porte', 60, 'Procedimentos cirúrgicos simples', 200.00),
('Cirurgia Grande Porte', 'cirurgia_grande_porte', 120, 'Procedimentos cirúrgicos complexos', 500.00),
('Exame Laboratorial', 'exame_laboratorial', 20, 'Coleta para exames', 60.00),
('Banho e Tosa', 'banho_tosa', 45, 'Serviços de higiene e estética', 35.00),
('Emergência', 'emergencia', 45, 'Atendimento de urgência', 120.00);

-- Function to check available time slots for a specific date
CREATE OR REPLACE FUNCTION public.get_available_time_slots(
  check_date DATE,
  consultation_type_param consultation_type
)
RETURNS TABLE(time_slot TIME, is_available BOOLEAN) AS $$
DECLARE
  duration_mins INTEGER;
  current_time TIME;
  end_time TIME;
  clinic_start TIME := '08:00'::TIME;
  clinic_end TIME := '18:00'::TIME;
  slot_interval INTERVAL := '30 minutes'::INTERVAL;
BEGIN
  -- Get duration for the consultation type
  SELECT duration_minutes INTO duration_mins
  FROM public.consultation_types
  WHERE type = consultation_type_param;
  
  current_time := clinic_start;
  
  WHILE current_time < clinic_end LOOP
    end_time := (current_time::interval + (duration_mins || ' minutes')::interval)::time;
    
    -- Check if this time slot is available
    RETURN QUERY
    SELECT 
      current_time,
      NOT EXISTS (
        SELECT 1 FROM public.appointments 
        WHERE appointment_date = check_date 
        AND status != 'cancelado'
        AND tsrange(appointment_time::text::time, appointments.end_time::text::time, '[)') && 
            tsrange(current_time::text::time, end_time::text::time, '[)')
      ) as is_available;
    
    current_time := (current_time::interval + slot_interval)::interval::time;
  END LOOP;
END;
$$ LANGUAGE plpgsql;