-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pets table
CREATE TABLE public.pets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  birth_date DATE,
  weight_grams INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schedule_blocks table for manual blocks (holidays, maintenance)
CREATE TABLE public.schedule_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  is_manual_block BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_hours table for clinic operating hours
CREATE TABLE public.business_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(day_of_week)
);

-- Update appointments table to reference clients and pets
ALTER TABLE public.appointments DROP COLUMN tutor_name;
ALTER TABLE public.appointments DROP COLUMN tutor_phone;
ALTER TABLE public.appointments DROP COLUMN tutor_email;
ALTER TABLE public.appointments DROP COLUMN pet_name;
ALTER TABLE public.appointments DROP COLUMN pet_species;
ALTER TABLE public.appointments DROP COLUMN pet_breed;
ALTER TABLE public.appointments DROP COLUMN pet_age;
ALTER TABLE public.appointments DROP COLUMN pet_weight_grams;

ALTER TABLE public.appointments ADD COLUMN client_id UUID REFERENCES public.clients(id);
ALTER TABLE public.appointments ADD COLUMN pet_id UUID REFERENCES public.pets(id);
ALTER TABLE public.appointments ADD COLUMN origin TEXT DEFAULT 'web';
ALTER TABLE public.appointments ADD COLUMN notes TEXT;

-- Update consultation_types to include price in cents
ALTER TABLE public.consultation_types ADD COLUMN price_cents INTEGER;
ALTER TABLE public.consultation_types DROP COLUMN price;

-- Enable RLS on new tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

-- Create policies for clients (anyone can create and view)
CREATE POLICY "Anyone can create clients" 
ON public.clients 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view clients" 
ON public.clients 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update clients" 
ON public.clients 
FOR UPDATE 
USING (true);

-- Create policies for pets (anyone can create and view)
CREATE POLICY "Anyone can create pets" 
ON public.pets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view pets" 
ON public.pets 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update pets" 
ON public.pets 
FOR UPDATE 
USING (true);

-- Create policies for schedule blocks (anyone can view, admin can manage)
CREATE POLICY "Anyone can view schedule blocks" 
ON public.schedule_blocks 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create schedule blocks" 
ON public.schedule_blocks 
FOR INSERT 
WITH CHECK (true);

-- Create policies for business hours (anyone can view)
CREATE POLICY "Anyone can view business hours" 
ON public.business_hours 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can manage business hours" 
ON public.business_hours 
FOR ALL 
USING (true);

-- Create triggers for timestamp updates
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedule_blocks_updated_at
  BEFORE UPDATE ON public.schedule_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_hours_updated_at
  BEFORE UPDATE ON public.business_hours
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default business hours (Monday to Friday 8:00-18:00)
INSERT INTO public.business_hours (day_of_week, start_time, end_time, is_active) VALUES
(1, '08:00', '18:00', true), -- Monday
(2, '08:00', '18:00', true), -- Tuesday
(3, '08:00', '18:00', true), -- Wednesday
(4, '08:00', '18:00', true), -- Thursday
(5, '08:00', '18:00', true), -- Friday
(6, '08:00', '12:00', false), -- Saturday (closed)
(0, '08:00', '12:00', false); -- Sunday (closed)

-- Update consultation types with prices in cents
UPDATE public.consultation_types SET price_cents = 8000 WHERE type = 'consulta_geral';
UPDATE public.consultation_types SET price_cents = 4500 WHERE type = 'vacinacao';
UPDATE public.consultation_types SET price_cents = 20000 WHERE type = 'cirurgia_pequeno_porte';
UPDATE public.consultation_types SET price_cents = 50000 WHERE type = 'cirurgia_grande_porte';
UPDATE public.consultation_types SET price_cents = 6000 WHERE type = 'exame_laboratorial';
UPDATE public.consultation_types SET price_cents = 3500 WHERE type = 'banho_tosa';
UPDATE public.consultation_types SET price_cents = 12000 WHERE type = 'emergencia';

-- Function to check if appointment time is within business hours
CREATE OR REPLACE FUNCTION public.is_within_business_hours(
  appointment_start TIMESTAMP WITH TIME ZONE,
  appointment_end TIMESTAMP WITH TIME ZONE
) RETURNS BOOLEAN AS $$
DECLARE
  day_of_week INT;
  start_time TIME;
  end_time TIME;
  is_active BOOLEAN;
BEGIN
  -- Get day of week (0 = Sunday, 6 = Saturday)
  day_of_week := EXTRACT(DOW FROM appointment_start);
  
  -- Get business hours for this day
  SELECT bh.start_time, bh.end_time, bh.is_active
  INTO start_time, end_time, is_active
  FROM public.business_hours bh
  WHERE bh.day_of_week = day_of_week;
  
  -- If no business hours found or not active, return false
  IF NOT FOUND OR NOT is_active THEN
    RETURN FALSE;
  END IF;
  
  -- Check if appointment time is within business hours
  RETURN (
    appointment_start::TIME >= start_time AND
    appointment_end::TIME <= end_time
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check appointment conflicts including schedule blocks
CREATE OR REPLACE FUNCTION public.check_appointment_conflicts(
  appointment_start TIMESTAMP WITH TIME ZONE,
  appointment_end TIMESTAMP WITH TIME ZONE,
  exclude_appointment_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check for appointment conflicts
  IF EXISTS (
    SELECT 1 FROM public.appointments
    WHERE status IN ('agendado', 'confirmado', 'em_andamento')
    AND (exclude_appointment_id IS NULL OR id != exclude_appointment_id)
    AND NOT (end_time <= appointment_start OR appointment_time >= appointment_end)
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check for schedule block conflicts
  IF EXISTS (
    SELECT 1 FROM public.schedule_blocks
    WHERE NOT (end_time <= appointment_start OR start_time >= appointment_end)
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX idx_appointments_pet_id ON public.appointments(pet_id);
CREATE INDEX idx_appointments_start_end ON public.appointments(appointment_time, end_time);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_pets_client_id ON public.pets(client_id);
CREATE INDEX idx_schedule_blocks_time ON public.schedule_blocks(start_time, end_time);
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_clients_phone ON public.clients(phone);