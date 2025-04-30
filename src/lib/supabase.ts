import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

type UserRole = 'student' | 'staff' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  registrationNumber?: string;
}

export const signInWithRegistration = async (
  registrationNumber: string,
  password: string
): Promise<AuthUser> => {
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('*')
    .eq('registration_number', registrationNumber)
    .single();

  if (studentError) {
    throw new Error('Invalid credentials');
  }

  if (password !== student.password_hash) {
    throw new Error('Invalid credentials');
  }

  await supabase
    .from('students')
    .update({ last_login: new Date().toISOString() })
    .eq('id', student.id);

  return {
    id: student.id,
    name: student.name,
    email: student.email,
    role: 'student',
    registrationNumber: student.registration_number,
  };
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('*')
    .eq('email', email)
    .single();

  if (staffError) {
    throw new Error('Invalid credentials');
  }

  // Check against the new password_user column
  if (password !== staff.password_user) {
    throw new Error('Invalid credentials');
  }

  // Update last login
  await supabase
    .from('staff')
    .update({ last_login: new Date().toISOString() })
    .eq('id', staff.id);

  // Ensure the role is either 'staff' or 'admin'
  const role = staff.role === 'admin' ? 'admin' : 'staff';

  return {
    id: staff.id,
    name: staff.name,
    email: staff.email,
    role: role,
  };
}; 