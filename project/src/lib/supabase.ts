import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'student' | 'staff' | 'admin';

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

  // In a real app, you would verify the password hash here
  // For demo purposes, we're just checking if it matches
  if (password !== student.password_hash) {
    throw new Error('Invalid credentials');
  }

  // Update last login
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

  // In a real app, you would verify the password hash here
  // For demo purposes, we're just checking if it matches
  if (password !== staff.password_hash) {
    throw new Error('Invalid credentials');
  }

  // Update last login
  await supabase
    .from('staff')
    .update({ last_login: new Date().toISOString() })
    .eq('id', staff.id);

  return {
    id: staff.id,
    name: staff.name,
    email: staff.email,
    role: staff.role as UserRole,
  };
};

export const registerStudent = async (
  registrationNumber: string,
  name: string,
  email: string,
  password: string
): Promise<AuthUser> => {
  // In a real app, you would hash the password here
  const passwordHash = password;

  const { data: student, error } = await supabase
    .from('students')
    .insert({
      registration_number: registrationNumber,
      name,
      email,
      password_hash: passwordHash,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique violation
      throw new Error('Registration number or email already exists');
    }
    throw error;
  }

  return {
    id: student.id,
    name: student.name,
    email: student.email,
    role: 'student',
    registrationNumber: student.registration_number,
  };
};