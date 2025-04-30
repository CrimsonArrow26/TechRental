export const signInWithRegistration = async (
  registrationNumber: string,
  password: string
): Promise<AuthUser> => {
  // 1. Lookup student by registration number
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('email, id, name, registration_number')
    .eq('registration_number', registrationNumber)
    .single();

  if (studentError || !student) {
    throw new Error('Invalid credentials');
  }

  // 2. Use Supabase Auth to sign in with the student's email
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: student.email,
    password,
  });

  if (authError || !authData.user) {
    throw new Error('Invalid credentials');
  }

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
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    throw new Error('Invalid credentials');
  }

  // Optionally, fetch staff/admin details from your table if you need more info
  // const { data: staff } = await supabase.from('staff').select('*').eq('email', email).single();

  return {
    id: authData.user.id,
    name: authData.user.user_metadata?.name || '',
    email: authData.user.email,
    role: authData.user.user_metadata?.role || 'staff', // or fetch from your table
  };
}; 