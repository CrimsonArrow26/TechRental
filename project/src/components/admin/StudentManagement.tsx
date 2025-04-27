import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle, X } from 'lucide-react';
import { searchStudents, processReturn } from '../../lib/api';

interface Student {
  id: string;
  name: string;
  email: string;
  registration_number: string;
  rentals: Array<{
    id: string;
    item: {
      name: string;
      model_number: string | null;
    };
    serial_number: {
      serial_number: string;
    };
    issued_date: string;
    due_date: string;
    status: string;
  }>;
}

const StudentManagement: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [showReturnConfirm, setShowReturnConfirm] = useState<string | null>(null);
  const [returnSuccess, setReturnSuccess] = useState<string | null>(null);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.length >= 2) {
        loadStudents(searchQuery);
      } else if (searchQuery.length === 0) {
        // Load all students when search is empty
        loadAllStudents();
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const loadAllStudents = async () => {
    try {
      setLoading(true);
      // This would call an API endpoint that returns all students
      const data = await searchStudents('');
      setStudents(data);
    } catch (err) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async (query: string) => {
    try {
      setLoading(true);
      const data = await searchStudents(query);
      setStudents(data);
    } catch (err) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (rentalId: string) => {
    try {
      await processReturn(rentalId);
      setReturnSuccess(`Successfully returned item`);
      setShowReturnConfirm(null);
      
      // Refresh student data
      if (searchQuery.length >= 2) {
        loadStudents(searchQuery);
      } else {
        loadAllStudents();
      }
      
      setTimeout(() => {
        setReturnSuccess(null);
      }, 3000);
    } catch (err) {
      setError('Failed to process return');
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date() > new Date(dueDate);
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (searchQuery.length < 2 && searchQuery.length > 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Enter at least 2 characters to search for students
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {searchQuery.length >= 2 
          ? `No students found matching "${searchQuery}"`
          : "No students found in the system"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {returnSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <p className="text-green-700">{returnSuccess}</p>
          </div>
        </div>
      )}

      {students.map(student => (
        <div key={student.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div 
            className="px-6 py-4 cursor-pointer hover:bg-gray-50"
            onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
                <p className="text-sm text-gray-500">ID: {student.registration_number}</p>
              </div>
              <div className="text-sm text-gray-500">
                {student.rentals.length} active {student.rentals.length === 1 ? 'rental' : 'rentals'}
              </div>
            </div>
          </div>

          {selectedStudent === student.id && (
            <div className="border-t border-gray-200">
              {student.rentals.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {student.rentals.map(rental => (
                    <div key={rental.id} className="px-6 py-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">{rental.item.name}</h4>
                          <p className="text-sm text-gray-500">
                            Serial: {rental.serial_number.serial_number}
                          </p>
                          <div className="flex items-center mt-1">
                            <Clock className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-500">
                              Issued: {new Date(rental.issued_date).toLocaleDateString()}
                            </span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className="text-sm text-gray-500">
                              Due: {new Date(rental.due_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isOverdue(rental.due_date)
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {isOverdue(rental.due_date) ? 'Overdue' : 'Active'}
                          </span>

                          {showReturnConfirm === rental.id ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleReturn(rental.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setShowReturnConfirm(null)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowReturnConfirm(rental.id)}
                              className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                            >
                              Return
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-4 text-center text-gray-500">
                  No active rentals for this student
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StudentManagement;